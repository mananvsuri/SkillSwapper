from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.auth import Token
from app.models import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.session import SessionLocal
from datetime import datetime
import re

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email address is already registered"
            )
        
        # Additional validation checks
        if not user.name or not user.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name is required"
            )
        
        if not user.email or not user.email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, user.email.lower()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid email address"
            )
        
        # Validate password strength
        if len(user.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Check password complexity
        has_lowercase = re.search(r'[a-z]', user.password)
        has_uppercase = re.search(r'[A-Z]', user.password)
        has_digit = re.search(r'\d', user.password)
        has_special = re.search(r'[!@#$%^&*(),.?":{}|<>]', user.password)
        
        strength_score = sum([bool(has_lowercase), bool(has_uppercase), bool(has_digit), bool(has_special)])
        if strength_score < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too weak. Include lowercase, uppercase, numbers, and special characters"
            )
        
        # Hash password and create user
        hashed_password = get_password_hash(user.password)
        new_user = User(
            name=user.name.strip(),
            email=user.email.lower().strip(),
            password_hash=hashed_password,
            location=user.location.strip() if user.location else None,
            photo_path=user.photo_path,
            availability=user.availability,
            is_public=user.is_public
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"REGISTRATION ERROR: {str(e)}")
        print(f"ERROR TYPE: {type(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again."
        )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        # Validate input
        if not credentials.email or not credentials.email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        if not credentials.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )
        
        # Normalize email
        email = credentials.email.lower().strip()
        
        # Find user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid email or password"
            )
        
        # Check if user is banned
        if user.is_banned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Your account has been banned. Please contact support."
            )
        
        # Verify password
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid email or password"
            )
        
        # Update last login
        user.last_login = datetime.now()
        db.commit()
        
        # Create access token
        access_token = create_access_token(data={"email": user.email})
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again."
        )
