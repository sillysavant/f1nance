from pydantic import BaseModel

class CurrencyTraceOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    date: str

    class Config:
        orm_mode = True
