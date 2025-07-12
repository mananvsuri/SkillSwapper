from pydantic import BaseModel
from enum import Enum
from typing import Optional

class SwapStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"

class SwapBase(BaseModel):
    from_user_id: int
    to_user_id: int
    skill_offered_id: int
    skill_requested_id: int

class SwapCreate(SwapBase):
    pass

class SwapResponse(SwapBase):
    id: int
    status: SwapStatus

    class Config:
        from_attributes = True

class SwapRequest(BaseModel):
    to_user_id: int
    skill_offered_id: int
    skill_requested_id: int

class SwapDetailResponse(BaseModel):
    id: int
    from_user_id: Optional[int] = None
    to_user_id: Optional[int] = None
    skill_offered_id: Optional[int] = None
    skill_requested_id: Optional[int] = None
    status: SwapStatus
    from_user_name: str = "Unknown"
    to_user_name: str = "Unknown"
    skill_offered_name: str = "Unknown"
    skill_requested_name: str = "Unknown"

    class Config:
        from_attributes = True
