import asyncio
import ipaddress
from datetime import datetime, timedelta, UTC
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from icmplib import async_multiping
from .models import Device, UptimeLog, SystemSettings
from .database import AsyncSessionLocal
import logging
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import socket

async def check_port(ip: str, port: int, timeout: float = 0.5) -> bool:
    """Checks if a specific port is open on an IP."""
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(ip, port), timeout=timeout
        )
        writer.close()
        await writer.wait_closed()
        return True
    except:
        return False

async def identify_device_type(ip: str) -> str:
    """Heuristics to identify device type based on open ports."""
    # Define common port mappings
    profiles = {
        "Router": [53, 80, 443],
        "Server": [22, 3306, 5432, 8080],
        "PC": [135, 139, 445],
        "Printer": [631, 9100],
    }
    
    # Check ports in parallel
    tasks = {profile: [check_port(ip, p) for p in ports] for profile, ports in profiles.items()}
    
    for profile, port_tasks in tasks.items():
        results = await asyncio.gather(*port_tasks)
        if any(results):
            return profile
            
    return "PC" # Default fallback

async def get_settings(session: AsyncSession):
    result = await session.execute(select(SystemSettings).limit(1))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = SystemSettings()
        session.add(settings)
        await session.commit()
        await session.refresh(settings)
    return settings

async def perform_network_scan():
    """Tüm kayıtlı ve aktif cihazları tarar."""
    async with AsyncSessionLocal() as session:
        settings = await get_settings(session)
        result = await session.execute(select(Device).where(Device.is_active == True))
        devices = result.scalars().all()
        
        if not devices:
            # Liste boşsa otomatik keşfi tetikleyebiliriz
            await auto_discover_subnet(settings.subnet_range)
            return

        ip_list = [d.ip_address for d in devices]
        try:
            # privileged=False Windows'ta admin olmayan yetkiler için kritik
            hosts = await async_multiping(ip_list, count=1, timeout=1, privileged=False)
            host_map = {h.address: h for h in hosts}
            
            for device in devices:
                host = host_map.get(device.ip_address)
                is_alive = host.is_alive if host else False
                latency = host.avg_rtt if host and is_alive else None
                
                await process_device_result(session, device, is_alive, latency, settings)
                
            await session.commit()
        except Exception as e:
            logger.error(f"Scan error: {e}")

async def process_device_result(session: AsyncSession, device: Device, is_alive: bool, latency: float, settings: SystemSettings):
    """Tarama sonucuna göre cihaz durumunu ve hata toleransını günceller."""
    previous_status = device.last_status
    
    if is_alive:
        device.fail_count = 0
        device.last_status = "Up"
        device.last_latency = latency
        device.last_seen = datetime.now(UTC)
    else:
        device.fail_count += 1
        if device.fail_count >= settings.error_threshold:
            device.last_status = "Down"
            device.last_latency = None
            
    if previous_status != device.last_status and device.last_status != "Unknown":
        new_log = UptimeLog(
            device_id=device.id,
            status=device.last_status,
            latency=latency,
            timestamp=datetime.now(UTC)
        )
        session.add(new_log)
        
        # Sadece gerçek düşüşlerde bildirim at
        if device.last_status == "Down" and previous_status == "Up":
            await send_notifications(device, "DOWN", settings)
        elif device.last_status == "Up" and previous_status == "Down":
            await send_notifications(device, "RECOVERED", settings)

async def auto_discover_subnet(subnet: str):
    """Scans all IPs on the subnet and adds new devices."""
    logger.info(f"Starting discovery on {subnet}")
    try:
        # Subnet'teki IP'leri genişlet (Network ve Broadcast hariç)
        net = ipaddress.ip_network(subnet, strict=False)
        # Sadece ilk 254 IP'yi tara (Performans için kısıtla veya tamamını tara)
        # Genelde /24 için hepsi taranabilir
        ips = [str(ip) for ip in net.hosts()]
        
        # Parçalı tarama (Gerektiğinde büyük ağlar için parçalanabilir)
        hosts = await async_multiping(ips, count=1, timeout=1, privileged=False)
        
        async with AsyncSessionLocal() as session:
            for host in hosts:
                if host.is_alive:
                    # Cihaz zaten var mı?
                    stmt = select(Device).where(Device.ip_address == host.address)
                    existing = (await session.execute(stmt)).scalar_one_or_none()
                    
                    if not existing:
                        discovered_type = await identify_device_type(host.address)
                        new_device = Device(
                            ip_address=host.address,
                            name=f"Device ({host.address})",
                            device_type=discovered_type,
                            last_status="Up",
                            last_seen=datetime.now(UTC),
                            last_latency=host.avg_rtt
                        )
                        session.add(new_device)
                        logger.info(f"NEW DEVICE FOUND: {host.address} ({discovered_type})")
            await session.commit()
            logger.info("Discovery task completed.")
    except Exception as e:
        logger.error(f"Discovery error: {e}")

async def send_notifications(device: Device, event: str, settings: SystemSettings):
    message = f"🚨 ALERT: Device {device.name} ({device.ip_address}) status: {event}!"
    
    # Discord
    if settings.discord_webhook:
        async with httpx.AsyncClient() as client:
            try:
                await client.post(settings.discord_webhook, json={"content": message})
            except Exception as e: logger.error(f"Discord error: {e}")

    # Slack
    if settings.slack_webhook:
        async with httpx.AsyncClient() as client:
            try:
                await client.post(settings.slack_webhook, json={"text": message})
            except Exception as e: logger.error(f"Slack error: {e}")

    # Telegram (Basit uygulama)
    if settings.telegram_bot_token and settings.telegram_chat_id:
        url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
        async with httpx.AsyncClient() as client:
            try:
                await client.post(url, json={"chat_id": settings.telegram_chat_id, "text": message})
            except Exception as e: logger.error(f"Telegram error: {e}")

async def cleanup_old_logs():
    threshold = datetime.now(UTC) - timedelta(days=30) # Varsa ayarlardan çekilebilir
    async with AsyncSessionLocal() as session:
        query = delete(UptimeLog).where(UptimeLog.timestamp < threshold)
        await session.execute(query)
        await session.commit()
