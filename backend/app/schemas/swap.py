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
        orm_mode = True
