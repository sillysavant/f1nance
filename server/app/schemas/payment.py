# app/schemas/payment.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PaymentBase(BaseModel):
    amount: float
    currency: str = "USD"
    status: str = "pending"
    promo_code: Optional[str] = None
    refunded: bool = False

class PaymentCreate(PaymentBase):
    user_id: int

class PaymentUpdate(BaseModel):
    status: Optional[str]
    refunded: Optional[bool]

class PaymentOut(BaseModel):
    id: int
    user_id: int
    amount: float
    status: str
    refunded: bool
    refunded_at: Optional[datetime] = None

    class Config:
        orm_mode = True
