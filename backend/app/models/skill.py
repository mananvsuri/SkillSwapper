from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class SkillType(str, enum.Enum):
    offered = "offered"
    wanted = "wanted"

class SkillLevel(str, enum.Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    pro = "Pro"

class SkillStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    type = Column(Enum(SkillType), nullable=False)
    level = Column(Enum(SkillLevel), nullable=False)
    status = Column(Enum(SkillStatus), default=SkillStatus.approved)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="skills")
