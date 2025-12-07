from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaxResourceBase(BaseModel):
    title: str
    type: str
    access: str
    download_url: Optional[str] = None

class TaxResourceCreate(TaxResourceBase):
    pass

class TaxResourceUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    access: Optional[str] = None
    download_url: Optional[str] = None

class TaxResourceOut(TaxResourceBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
