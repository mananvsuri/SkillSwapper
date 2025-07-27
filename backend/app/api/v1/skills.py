from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.models import Skill, User
from app.schemas.skill import SkillCreate, SkillResponse
from app.core.security import decode_access_token
from app.db.session import SessionLocal

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

@router.post("/skills", response_model=SkillResponse)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    new_skill = Skill(
        user_id=user.id,
        name=skill.name,
        type=skill.type,
        level=skill.level
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.get("/skills", response_model=list[SkillResponse])
def get_my_skills(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Skill).filter(Skill.user_id == user.id).all()
