from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str               # required by DB
    full_name: str | None = None
    visa_status: str            # do NOT allow None, DB expects a string (F1)
    education: str
    nationality: str

class UserCreate(UserBase):
    password: str               # no extra overrides
    nationality: str  # REQUIRED
    visa_status: Optional[str] = "F1"
    username: str  # REQUIRED

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_superuser: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    message: Optional[str] = None
class UpdateUserProfileRequest(BaseModel):
    full_name: Optional[str]
    education: Optional[str]
    nationality: Optional[str]
    visa_status: Optional[str]
