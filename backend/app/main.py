from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .database import engine, Base, get_db
from .models import Device, UptimeLog
from . import schemas
from .scanner import perform_network_scan, cleanup_old_logs

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Veritabanı tablolarını oluştur
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Scheduler Kurulumu
    scheduler = AsyncIOScheduler()
    # 60 saniyede bir tarama yap
    scheduler.add_job(perform_network_scan, 'interval', seconds=60)
    # Günde bir kez temizlik yap
    scheduler.add_job(cleanup_old_logs, 'cron', hour=0, minute=0)
    
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(title="Net-Monitor API", lifespan=lifespan)

# CORS ayarları (React dashboard için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS ---

@app.get("/devices", response_model=list[schemas.Device])
async def get_devices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device))
    return result.scalars().all()

@app.post("/devices", response_model=schemas.Device)
async def create_device(device_in: schemas.DeviceCreate, db: AsyncSession = Depends(get_db)):
    # IP adresi çakışması kontrolü
    result = await db.execute(select(Device).where(Device.ip_address == device_in.ip_address))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="IP address already registered")
    
    db_device = Device(**device_in.model_dump())
    db.add(db_device)
    await db.commit()
    await db.refresh(db_device)
    return db_device

@app.delete("/devices/{device_id}")
async def delete_device(device_id: int, db: AsyncSession = Depends(get_db)):
    db_device = await db.get(Device, device_id)
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    await db.delete(db_device)
    await db.commit()
    return {"status": "success"}

@app.put("/devices/{device_id}", response_model=schemas.Device)
async def update_device(device_id: int, device_in: schemas.DeviceUpdate, db: AsyncSession = Depends(get_db)):
    db_device = await db.get(Device, device_id)
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    for field, value in device_in.model_dump(exclude_unset=True).items():
        setattr(db_device, field, value)
        
    await db.commit()
    await db.refresh(db_device)
    return db_device

@app.get("/settings", response_model=schemas.SystemSettings)
async def get_system_settings(db: AsyncSession = Depends(get_db)):
    from .scanner import get_settings
    return await get_settings(db)

@app.put("/settings", response_model=schemas.SystemSettings)
async def update_system_settings(settings_in: schemas.SystemSettings, db: AsyncSession = Depends(get_db)):
    from .scanner import get_settings
    db_settings = await get_settings(db)
    for field, value in settings_in.model_dump().items():
        setattr(db_settings, field, value)
    await db.commit()
    await db.refresh(db_settings)
    return db_settings

@app.post("/discover")
async def trigger_discovery(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    from .scanner import get_settings, auto_discover_subnet
    settings = await get_settings(db)
    background_tasks.add_task(auto_discover_subnet, settings.subnet_range)
    return {"status": "Discovery started in background"}

@app.get("/stats", response_model=schemas.DeviceStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count(Device.id)))
    up = await db.scalar(select(func.count(Device.id)).where(Device.last_status == "Up"))
    down = await db.scalar(select(func.count(Device.id)).where(Device.last_status == "Down"))
    return {"total": total or 0, "up": up or 0, "down": down or 0}

@app.get("/logs/{device_id}", response_model=list[schemas.UptimeLog])
async def get_device_logs(device_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UptimeLog).where(UptimeLog.device_id == device_id).order_by(UptimeLog.timestamp.desc()).limit(50)
    )
    return result.scalars().all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
