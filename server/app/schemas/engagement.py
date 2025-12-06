# server/app/schemas/engagement.py
from pydantic import BaseModel
from datetime import datetime

class EngagementOut(BaseModel):
    id: int
    user_id: int
    module_name: str
    action: str
    timestamp: datetime
    critical_date: datetime | None
    snoozed_until: datetime | None
    is_done: bool

    class Config:
        orm_mode = True

class EngagementCreate(BaseModel):
    module_name: str
    action: str
    critical_date: datetime | None = None
