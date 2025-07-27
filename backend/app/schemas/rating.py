from pydantic import BaseModel
from typing import Optional

class RatingCreate(BaseModel):
    to_user_id: int
    stars: int
    feedback: Optional[str] = None

class RatingResponse(BaseModel):
    id: int
    swap_id: int
    from_user_id: int
    to_user_id: int
    stars: int
    feedback: Optional[str] = None

    class Config:
        from_attributes = True

class SwapCompleteRequest(BaseModel):
    swap_id: int

