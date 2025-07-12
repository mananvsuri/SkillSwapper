from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.swap import Swap, SwapStatus
from app.schemas.swap import SwapCreate, SwapResponse
from app.api.v1.deps import get_db, get_current_user

router = APIRouter()

@router.post("/swaps", response_model=SwapResponse)
def create_swap(swap: SwapCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    new_swap = Swap(
        from_user_id=user.id,
        to_user_id=swap.to_user_id,
        skill_offered_id=swap.skill_offered_id,
        skill_requested_id=swap.skill_requested_id,
        status=SwapStatus.pending
    )
    db.add(new_swap)
    db.commit()
    db.refresh(new_swap)
    return new_swap

@router.get("/swaps", response_model=list[SwapResponse])
def get_my_swaps(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Swap).filter(
        (Swap.from_user_id == user.id) | (Swap.to_user_id == user.id)
    ).all()

@router.delete("/swaps/{swap_id}", response_model=dict)
def delete_swap(swap_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    swap = db.query(Swap).filter(Swap.id == swap_id, Swap.from_user_id == user.id).first()
    if not swap:
        raise HTTPException(status_code=404, detail="Swap not found or not authorized")
    db.delete(swap)
    db.commit()
    return {"message": "Swap deleted successfully"}
