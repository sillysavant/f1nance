from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BankAccountCreate(BaseModel):
    name: str
    type: str
    account_number: str
    balance: Optional[float] = 0.0

class BankAccountOut(BaseModel):
    id: int
    name: str
    type: str
    account_number: str
    balance: float
    last_sync: datetime

    class Config:
        orm_mode = True
