from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.models.base import Base

class PlatformMessage(Base):
    __tablename__ = "platform_messages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    message_type = Column(String, default="info")  # info, warning, error, success
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, nullable=True)  # admin user id
    is_active = Column(String, default=True) 