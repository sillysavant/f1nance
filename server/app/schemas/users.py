# app/schemas/users.py
from pydantic import BaseModel
from typing import Optional

class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None

    class Config:
        orm_mode = True
