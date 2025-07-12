from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserResponse
from app.api.v1.deps import get_db, get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: UserResponse = Depends(get_current_user)):
    return current_user
