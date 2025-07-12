from sqlalchemy.ext.declarative import as_declarative, declared_attr

@as_declarative()
class Base:
    id: int

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    location = Column(String, nullable=True)
    photo_path = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    is_public = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    skills = relationship("Skill", back_populates="user")
    swaps_sent = relationship("Swap", back_populates="sender", foreign_keys="Swap.from_user_id")
    swaps_received = relationship("Swap", back_populates="receiver", foreign_keys="Swap.to_user_id")
    ratings_given = relationship("Rating", back_populates="rater", foreign_keys="Rating.from_user_id")
    ratings_received = relationship("Rating", back_populates="ratee", foreign_keys="Rating.to_user_id")
    swapcoins = relationship("SwapCoin", back_populates="user")
