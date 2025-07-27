from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.models.base import Base

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True)
    swap_id = Column(Integer, ForeignKey("swaps.id"))
    from_user_id = Column(Integer, ForeignKey("users.id"))
    to_user_id = Column(Integer, ForeignKey("users.id"))
    stars = Column(Integer, nullable=False)
    feedback = Column(String)

    rater = relationship("User", foreign_keys=[from_user_id], back_populates="ratings_given")
    ratee = relationship("User", foreign_keys=[to_user_id], back_populates="ratings_received")
