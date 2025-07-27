from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
import re

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    location: Optional[str] = Field(None, max_length=100, description="User's location")
    photo_path: Optional[str] = Field(None, description="Path to user's profile photo")
    availability: Optional[str] = Field(None, max_length=200, description="User's availability")
    is_public: Optional[bool] = Field(True, description="Whether user profile is public")

    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name is required')
        
        # Remove extra spaces and validate format
        cleaned_name = ' '.join(v.strip().split())
        
        # Check for valid characters (letters, spaces, hyphens, apostrophes)
        if not re.match(r"^[a-zA-Z\s'-]+$", cleaned_name):
            raise ValueError('Name can only contain letters, spaces, hyphens, and apostrophes')
        
        # Check length after cleaning
        if len(cleaned_name) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if len(cleaned_name) > 50:
            raise ValueError('Name must be no more than 50 characters long')
        
        return cleaned_name

    @validator('email')
    def validate_email(cls, v):
        if not v or not v.strip():
            raise ValueError('Email is required')
        
        # Normalize email (lowercase, trim)
        normalized_email = v.strip().lower()
        
        # Basic email format validation (EmailStr already does this, but we add extra checks)
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", normalized_email):
            raise ValueError('Please enter a valid email address')
        
        return normalized_email

    @validator('location')
    def validate_location(cls, v):
        if v is None or not v.strip():
            return None
        
        cleaned_location = v.strip()
        if len(cleaned_location) < 2:
            raise ValueError('Location must be at least 2 characters long')
        if len(cleaned_location) > 100:
            raise ValueError('Location must be no more than 100 characters long')
        
        return cleaned_location

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User's password")

    @validator('password')
    def validate_password(cls, v):
        if not v:
            raise ValueError('Password is required')
        
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        # Check password strength
        has_lowercase = bool(re.search(r'[a-z]', v))
        has_uppercase = bool(re.search(r'[A-Z]', v))
        has_digit = bool(re.search(r'\d', v))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', v))
        strength_score = sum([has_lowercase, has_uppercase, has_digit, has_special])
        if strength_score < 3:
            raise ValueError('Password is too weak. Include lowercase, uppercase, numbers, and special characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    @validator('email')
    def validate_email(cls, v):
        if not v or not v.strip():
            raise ValueError('Email is required')
        return v.strip().lower()

    @validator('password')
    def validate_password(cls, v):
        if not v:
            raise ValueError('Password is required')
        return v

class UserResponse(UserBase):
    id: int = Field(..., description="User's unique identifier")
    is_admin: bool = Field(False, description="Whether user is an admin")

    class Config:
        from_attributes = True
