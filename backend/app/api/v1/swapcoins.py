from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import User, SwapCoin, Swap
from app.core.auth import get_current_user
from typing import Optional

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/coins")
def get_user_coins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's swap coins"""
    try:
        # Get or create swap coins record for the user
        swap_coins = db.query(SwapCoin).filter(SwapCoin.user_id == current_user.id).first()
        
        if not swap_coins:
            # Create a new swap coins record with 0 coins
            swap_coins = SwapCoin(user_id=current_user.id, coins=0)
            db.add(swap_coins)
            db.commit()
            db.refresh(swap_coins)
        
        return {"coins": swap_coins.coins}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching coins"
        )

@router.post("/coins/add")
def add_coins(
    amount: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add coins to user's account"""
    try:
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be positive"
            )
        
        # Get or create swap coins record
        swap_coins = db.query(SwapCoin).filter(SwapCoin.user_id == current_user.id).first()
        
        if not swap_coins:
            swap_coins = SwapCoin(user_id=current_user.id, coins=amount)
            db.add(swap_coins)
        else:
            swap_coins.coins += amount
        
        db.commit()
        db.refresh(swap_coins)
        
        return {"coins": swap_coins.coins, "added": amount}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding coins"
        )

@router.post("/coins/deduct")
def deduct_coins(
    amount: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deduct coins from user's account"""
    try:
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be positive"
            )
        
        # Get swap coins record
        swap_coins = db.query(SwapCoin).filter(SwapCoin.user_id == current_user.id).first()
        
        if not swap_coins or swap_coins.coins < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient coins"
            )
        
        swap_coins.coins -= amount
        db.commit()
        db.refresh(swap_coins)
        
        return {"coins": swap_coins.coins, "deducted": amount}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deducting coins"
        )

@router.post("/coins/check-swap-bonus")
def check_swap_bonus(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has completed swaps and award bonus coins"""
    try:
        # Count user's completed swaps
        completed_swaps = db.query(Swap).filter(
            Swap.from_user_id == current_user.id,
            Swap.status == "completed"
        ).count()
        
        completed_swaps += db.query(Swap).filter(
            Swap.to_user_id == current_user.id,
            Swap.status == "completed"
        ).count()
        
        # Get or create swap coins record
        swap_coins = db.query(SwapCoin).filter(SwapCoin.user_id == current_user.id).first()
        
        if not swap_coins:
            swap_coins = SwapCoin(user_id=current_user.id, coins=0)
            db.add(swap_coins)
        
        # Award 5 coins per completed swap
        bonus_coins = completed_swaps * 5
        
        if bonus_coins > 0:
            swap_coins.coins += bonus_coins
            db.commit()
            db.refresh(swap_coins)
            
            return {
                "coins": swap_coins.coins,
                "bonus_awarded": bonus_coins,
                "completed_swaps": completed_swaps
            }
        else:
            return {
                "coins": swap_coins.coins,
                "bonus_awarded": 0,
                "completed_swaps": completed_swaps
            }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while checking swap bonus"
        ) 