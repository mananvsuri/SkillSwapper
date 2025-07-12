from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillResponse
from app.api.v1.deps import get_db, get_current_user

router = APIRouter()

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
