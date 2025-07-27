from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: str


# backend/app/schemas/swapcoin.py
from pydantic import BaseModel

class SwapCoinBase(BaseModel):
    user_id: int
    coins: int

class SwapCoinResponse(SwapCoinBase):
    id: int

    class Config:
        orm_mode = True
