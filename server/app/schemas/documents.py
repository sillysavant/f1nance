# app/schemas/documents.py
from pydantic import BaseModel
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    user_id: int
    filename: str
    uploaded_at: datetime

    class Config:
        orm_mode = True
