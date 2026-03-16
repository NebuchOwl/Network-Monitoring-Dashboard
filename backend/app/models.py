from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, UTC

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    device_type = Column(String, default="Unknown") # Printer, Server, Switch, Workstation
    is_active = Column(Boolean, default=True) # İzleme durumu
    
    # Gerçek zamanlı durum
    last_status = Column(String, default="Unknown") # Up, Down
    last_seen = Column(DateTime, nullable=True)
    last_latency = Column(Float, nullable=True) # ms cinsinden gecikme
    
    # Hata toleransı için yardımcı alan
    fail_count = Column(Integer, default=0)

    logs = relationship("UptimeLog", back_populates="device", cascade="all, delete-orphan")

class UptimeLog(Base):
    __tablename__ = "uptime_logs"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    status = Column(String) # Up, Down
    latency = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(UTC))

    device = relationship("Device", back_populates="logs")

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    subnet_range = Column(String, default="192.168.1.0/24")
    scan_interval = Column(Integer, default=60) # seconds
    error_threshold = Column(Integer, default=3) # retries before marking down
    
    # Notifications
    email_enabled = Column(Boolean, default=False)
    discord_webhook = Column(String, nullable=True)
    telegram_bot_token = Column(String, nullable=True)
    telegram_chat_id = Column(String, nullable=True)
    slack_webhook = Column(String, nullable=True)
