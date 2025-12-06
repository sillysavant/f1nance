from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.payments import PaymentStatus

class PaymentCreate(BaseModel):
    amount: float
    description: Optional[str] = ""
    scheduled_date: datetime

class PaymentUpdate(BaseModel):
    amount: Optional[float]
    description: Optional[str]
    scheduled_date: Optional[datetime]
    status: Optional[PaymentStatus]

class PaymentOut(BaseModel):
    id: int
    user_id: int
    amount: float
    description: str
    scheduled_date: datetime
    status: PaymentStatus

    class Config:
        orm_mode = True
