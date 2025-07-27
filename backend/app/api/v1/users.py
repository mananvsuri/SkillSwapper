from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File
from sqlalchemy.orm import Session
from app.models import User, Skill, Rating, Swap
from app.schemas.user import UserResponse
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from typing import List
from pydantic import BaseModel
from sqlalchemy import func
import os
import shutil
from pathlib import Path

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if payload is None or "email" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    user = db.query(User).filter(User.email == payload["email"]).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me", response_model=UserResponse)
def get_current_user_info(user=Depends(get_current_user)):
    return user

class ProfileVisibilityUpdate(BaseModel):
    is_public: bool

@router.put("/me/visibility")
def update_profile_visibility(
    visibility: ProfileVisibilityUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Update user's profile visibility (public/private)"""
    user.is_public = visibility.is_public
    db.commit()
    return {"message": f"Profile visibility updated to {'public' if visibility.is_public else 'private'}"}

class AvailabilityUpdate(BaseModel):
    availability: str

@router.put("/me/availability")
def update_availability(
    availability: AvailabilityUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Update user's availability"""
    user.availability = availability.availability
    db.commit()
    return {"message": "Availability updated successfully"}

class SkillInfo(BaseModel):
    id: int
    name: str
    level: str

class PublicUserWithSkills(BaseModel):
    id: int
    name: str
    location: str | None
    photo_path: str | None
    availability: str | None
    is_public: bool
    skills_offered: List[SkillInfo] = []
    skills_wanted: List[SkillInfo] = []
    
    class Config:
        from_attributes = True

@router.get("/public-users", response_model=List[PublicUserWithSkills])
def get_public_users(db: Session = Depends(get_db)):
    """Get all public users with their skills for the browse page (excluding admins)"""
    users = db.query(User).filter(
        User.is_public == True,
        User.is_admin == False
    ).all()
    
    result = []
    for user in users:
        # Get user's skills
        skills = db.query(Skill).filter(Skill.user_id == user.id).all()
        
        # Separate offered and wanted skills with full skill info
        skills_offered = [
            SkillInfo(id=skill.id, name=skill.name, level=skill.level) 
            for skill in skills if skill.type == "offered"
        ]
        skills_wanted = [
            SkillInfo(id=skill.id, name=skill.name, level=skill.level) 
            for skill in skills if skill.type == "wanted"
        ]
        
        result.append(PublicUserWithSkills(
            id=user.id,
            name=user.name,
            location=user.location,
            photo_path=user.photo_path,
            availability=user.availability,
            is_public=user.is_public,
            skills_offered=skills_offered,
            skills_wanted=skills_wanted
        ))
    
    return result

class UserStats(BaseModel):
    rating: float
    total_swaps: int
    coins: int

@router.get("/me/stats", response_model=UserStats)
def get_user_stats(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get user statistics including average rating and total swaps"""
    
    # Calculate average rating
    avg_rating_result = db.query(func.avg(Rating.stars)).filter(
        Rating.to_user_id == user.id
    ).scalar()
    
    avg_rating = float(avg_rating_result) if avg_rating_result else 0.0
    
    # Count total swaps
    total_swaps = db.query(Swap).filter(
        (Swap.from_user_id == user.id) | (Swap.to_user_id == user.id)
    ).count()
    
    # Get coins (assuming you have a SwapCoin model)
    from app.models import SwapCoin
    swap_coins = db.query(SwapCoin).filter(SwapCoin.user_id == user.id).first()
    coins = swap_coins.coins if swap_coins else 0
    
    return UserStats(
        rating=round(avg_rating, 1),
        total_swaps=total_swaps,
        coins=coins
    )

@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a profile photo"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Validate file size (max 5MB)
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 5MB"
            )
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        filename = f"user_{user.id}_{int(os.path.getmtime('uploads') if upload_dir.exists() else 0)}{file_extension}"
        file_path = upload_dir / filename
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update user's photo_path in database
        user.photo_path = f"/uploads/{filename}"
        db.commit()
        
        return {"message": "Photo uploaded successfully", "photo_path": user.photo_path}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while uploading the photo"
        )
