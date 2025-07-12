from pydantic import BaseModel
from typing import Optional

class RatingBase(BaseModel):
    swap_id: int
    from_user_id: int
    to_user_id: int
    stars: int
    feedback: Optional[str] = None

class RatingCreate(RatingBase):
    pass

class RatingResponse(RatingBase):
    id: int

    class Config:
        orm_mode = True

