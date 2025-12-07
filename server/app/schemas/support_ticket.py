from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SupportTicketBase(BaseModel):
    subject: str
    description: Optional[str] = None
    status: str  # "Open" | "In Progress" | "Resolved" | "Closed"

class SupportTicketCreate(SupportTicketBase):
    pass

class SupportTicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class SupportTicketOut(SupportTicketBase):
    id: int
    created_on: datetime
    last_updated: datetime
    user_id: int
    user_name: Optional[str] = None  # For admin display

    class Config:
        orm_mode = True
