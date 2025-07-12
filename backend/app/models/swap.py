from sqlalchemy import Column, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class SwapStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"
    completed = "completed"

class Swap(Base):
    __tablename__ = "swaps"

    id = Column(Integer, primary_key=True)
    from_user_id = Column(Integer, ForeignKey("users.id"))
    to_user_id = Column(Integer, ForeignKey("users.id"))
    skill_offered_id = Column(Integer, ForeignKey("skills.id"))
    skill_requested_id = Column(Integer, ForeignKey("skills.id"))
    status = Column(Enum(SwapStatus), default=SwapStatus.pending)

    sender = relationship("User", foreign_keys=[from_user_id], back_populates="swaps_sent")
    receiver = relationship("User", foreign_keys=[to_user_id], back_populates="swaps_received")
