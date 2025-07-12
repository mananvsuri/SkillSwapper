from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.models import User, Skill
from app.schemas.user import UserResponse
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from typing import List
from pydantic import BaseModel

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

class SkillInfo(BaseModel):
    id: int
    name: str
    level: str

class PublicUserWithSkills(BaseModel):
    id: int
    name: str
    location: str | None
    photo_path: str | None
    is_public: bool
    skills_offered: List[SkillInfo] = []
    skills_wanted: List[SkillInfo] = []
    
    class Config:
        from_attributes = True

@router.get("/public-users", response_model=List[PublicUserWithSkills])
def get_public_users(db: Session = Depends(get_db)):
    """Get all public users with their skills for the browse page"""
    users = db.query(User).filter(User.is_public == True).all()
    
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
            is_public=user.is_public,
            skills_offered=skills_offered,
            skills_wanted=skills_wanted
        ))
    
    return result
