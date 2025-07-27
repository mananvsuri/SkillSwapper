from pydantic import BaseModel
from typing import Optional
from enum import Enum

class SkillType(str, Enum):
    offered = "offered"
    wanted = "wanted"

class SkillLevel(str, Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    pro = "Pro"

class SkillBase(BaseModel):
    name: str
    type: SkillType
    level: SkillLevel

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
