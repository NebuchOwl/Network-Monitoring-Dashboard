from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class UptimeLogBase(BaseModel):
    status: str
    latency: Optional[float] = None
    timestamp: datetime

class UptimeLog(UptimeLogBase):
    id: int
    device_id: int
    
    model_config = ConfigDict(from_attributes=True)

class DeviceBase(BaseModel):
    ip_address: str
    name: Optional[str] = None
    device_type: str = "Unknown"
    is_active: bool = True

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    device_type: Optional[str] = None
    is_active: Optional[bool] = None

class Device(DeviceBase):
    id: int
    last_status: str
    last_seen: Optional[datetime] = None
    last_latency: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class DeviceStats(BaseModel):
    total: int
    up: int
    down: int

class SystemSettings(BaseModel):
    subnet_range: str
    scan_interval: int
    error_threshold: int
    email_enabled: bool
    discord_webhook: Optional[str] = None
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    slack_webhook: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
