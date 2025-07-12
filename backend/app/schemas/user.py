from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    location: Optional[str] = None
    photo_path: Optional[str] = None
    availability: Optional[str] = None
    is_public: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool

    class Config:
        orm_mode = True
