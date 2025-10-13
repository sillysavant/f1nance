from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List


class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        orm_mode = True


class BudgetCreate(BaseModel):
    name: str
    period: str
    amount: float
    categories: Optional[List[str]] = None
