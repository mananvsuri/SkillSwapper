from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    is_banned = Column(Boolean, default=False)
    # Make these optional to handle database migration issues
    created_at = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    skills = relationship("Skill", back_populates="user")
    ratings_given = relationship("Rating", foreign_keys="Rating.from_user_id", back_populates="rater")
    ratings_received = relationship("Rating", foreign_keys="Rating.to_user_id", back_populates="ratee")
    swaps_sent = relationship("Swap", foreign_keys="Swap.from_user_id", back_populates="sender")
    swaps_received = relationship("Swap", foreign_keys="Swap.to_user_id", back_populates="receiver")
