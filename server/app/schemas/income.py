from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IncomeCreate(BaseModel):
    amount: float
    description: Optional[str] = ""
    date: Optional[datetime] = None

class IncomeUpdate(BaseModel):
    amount: Optional[float]
    description: Optional[str]
    date: Optional[datetime]

class IncomeOut(BaseModel):
    id: int
    user_id: int
    amount: float
    description: str
    date: datetime

    class Config:
        orm_mode = True
