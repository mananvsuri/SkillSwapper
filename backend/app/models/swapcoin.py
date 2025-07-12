from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class SwapCoin(Base):
    __tablename__ = "swapcoins"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    coins = Column(Integer, default=0)

    user = relationship("User", back_populates="swapcoins")
