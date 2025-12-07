from pydantic import BaseModel, EmailStr

class AdminCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
