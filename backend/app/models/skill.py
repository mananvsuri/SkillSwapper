from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class SkillType(str, enum.Enum):
    offered = "offered"
    wanted = "wanted"

class SkillLevel(str, enum.Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    pro = "Pro"

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    type = Column(Enum(SkillType), nullable=False)
    level = Column(Enum(SkillLevel), nullable=False)

    user = relationship("User", back_populates="skills")
