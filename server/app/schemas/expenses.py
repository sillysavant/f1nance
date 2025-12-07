from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = ""
    date: Optional[datetime] = None

class ExpenseUpdate(BaseModel):
    category: Optional[str]
    amount: Optional[float]
    description: Optional[str]
    date: Optional[datetime]

class ExpenseOut(BaseModel):
    id: int
    user_id: int
    category: str
    amount: float
    description: str
    date: datetime

    class Config:
        orm_mode = True
