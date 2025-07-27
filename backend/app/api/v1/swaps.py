from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.models import Swap, SwapStatus, User, Skill, Rating, SwapCoin
from app.schemas.swap import SwapCreate, SwapResponse, SwapRequest, SwapDetailResponse
from app.schemas.rating import RatingCreate, RatingResponse, SwapCompleteRequest
from app.core.security import decode_access_token
from app.db.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if payload is None or "email" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    user = db.query(User).filter(User.email == payload["email"]).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/swaps", response_model=SwapResponse)
def create_swap(swap: SwapRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Validate that the skills belong to the users
    skill_offered = db.query(Skill).filter(
        Skill.id == swap.skill_offered_id,
        Skill.user_id == user.id
    ).first()
    
    if not skill_offered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill offered not found or doesn't belong to you"
        )
    
    skill_requested = db.query(Skill).filter(
        Skill.id == swap.skill_requested_id,
        Skill.user_id == swap.to_user_id
    ).first()
    
    if not skill_requested:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested skill not found or doesn't belong to the target user"
        )
    
    # Check if a swap already exists between these users for these skills
    existing_swap = db.query(Swap).filter(
        Swap.from_user_id == user.id,
        Swap.to_user_id == swap.to_user_id,
        Swap.skill_offered_id == swap.skill_offered_id,
        Swap.skill_requested_id == swap.skill_requested_id,
        Swap.status == SwapStatus.pending
    ).first()
    
    if existing_swap:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A swap request already exists for these skills"
        )
    
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

@router.get("/swaps", response_model=list[SwapDetailResponse])
def get_my_swaps(db: Session = Depends(get_db), user=Depends(get_current_user)):
    swaps = db.query(Swap).filter(
        (Swap.from_user_id == user.id) | (Swap.to_user_id == user.id)
    ).all()
    
    result = []
    for swap in swaps:
        # Get user names
        from_user = db.query(User).filter(User.id == swap.from_user_id).first()
        to_user = db.query(User).filter(User.id == swap.to_user_id).first()
        
        # Get skill names
        skill_offered = db.query(Skill).filter(Skill.id == swap.skill_offered_id).first()
        skill_requested = db.query(Skill).filter(Skill.id == swap.skill_requested_id).first()
        
        result.append(SwapDetailResponse(
            id=swap.id,
            from_user_id=swap.from_user_id,
            to_user_id=swap.to_user_id,
            skill_offered_id=swap.skill_offered_id,
            skill_requested_id=swap.skill_requested_id,
            status=swap.status,
            from_user_name=from_user.name if from_user else "Unknown",
            to_user_name=to_user.name if to_user else "Unknown",
            skill_offered_name=skill_offered.name if skill_offered else "Unknown",
            skill_requested_name=skill_requested.name if skill_requested else "Unknown"
        ))
    
    return result

@router.put("/swaps/{swap_id}/accept", response_model=SwapResponse)
def accept_swap(swap_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        Swap.to_user_id == user.id,
        Swap.status == SwapStatus.pending
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not authorized to accept"
        )
    
    swap.status = SwapStatus.accepted
    db.commit()
    db.refresh(swap)
    return swap

@router.put("/swaps/{swap_id}/complete", response_model=SwapResponse)
def complete_swap(swap_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Complete a swap and award coins to both users"""
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        (Swap.from_user_id == user.id) | (Swap.to_user_id == user.id),
        Swap.status == SwapStatus.accepted
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not in accepted status"
        )
    
    # Mark swap as completed
    swap.status = SwapStatus.completed
    
    # Award 5 coins to both users
    for user_id in [swap.from_user_id, swap.to_user_id]:
        swap_coins = db.query(SwapCoin).filter(SwapCoin.user_id == user_id).first()
        if not swap_coins:
            swap_coins = SwapCoin(user_id=user_id, coins=5)
            db.add(swap_coins)
        else:
            swap_coins.coins += 5
    
    db.commit()
    db.refresh(swap)
    return swap

@router.post("/swaps/{swap_id}/rate", response_model=RatingResponse)
def rate_swap(swap_id: int, rating: RatingCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Rate a completed swap"""
    # Verify the swap exists and is completed
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        Swap.status == SwapStatus.completed
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not completed"
        )
    
    # Verify user is part of the swap
    if user.id not in [swap.from_user_id, swap.to_user_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to rate this swap"
        )
    
    # Verify user is rating the other person in the swap
    other_user_id = swap.to_user_id if user.id == swap.from_user_id else swap.from_user_id
    if rating.to_user_id != other_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only rate the other person in the swap"
        )
    
    # Check if user already rated this swap
    existing_rating = db.query(Rating).filter(
        Rating.swap_id == swap_id,
        Rating.from_user_id == user.id
    ).first()
    
    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already rated this swap"
        )
    
    # Validate stars (1-5)
    if not 1 <= rating.stars <= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stars must be between 1 and 5"
        )
    
    new_rating = Rating(
        swap_id=swap_id,
        from_user_id=user.id,
        to_user_id=rating.to_user_id,
        stars=rating.stars,
        feedback=rating.feedback
    )
    
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

@router.get("/swaps/{swap_id}/ratings", response_model=list[RatingResponse])
def get_swap_ratings(swap_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get all ratings for a specific swap"""
    # Verify the swap exists and user is part of it
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        (Swap.from_user_id == user.id) | (Swap.to_user_id == user.id)
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not authorized"
        )
    
    ratings = db.query(Rating).filter(Rating.swap_id == swap_id).all()
    return ratings

@router.put("/swaps/{swap_id}/reject")
def reject_swap(swap_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        Swap.to_user_id == user.id,
        Swap.status == SwapStatus.pending
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not authorized to reject"
        )
    
    swap.status = SwapStatus.rejected
    db.commit()
    return {"message": "Swap rejected successfully"}

@router.delete("/swaps/{swap_id}", response_model=dict)
def delete_swap(swap_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        Swap.from_user_id == user.id
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not authorized to delete"
        )
    
    db.delete(swap)
    db.commit()
    return {"message": "Swap deleted successfully"}
