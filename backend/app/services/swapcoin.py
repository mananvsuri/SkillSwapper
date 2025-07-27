from sqlalchemy.orm import Session
from app.models.swapcoin import SwapCoin


def award_coins(user_id: int, db: Session, amount: int = 10):
    swapcoin = db.query(SwapCoin).filter(SwapCoin.user_id == user_id).first()
    if not swapcoin:
        swapcoin = SwapCoin(user_id=user_id, coins=amount)
        db.add(swapcoin)
    else:
        swapcoin.coins += amount
    db.commit()
    db.refresh(swapcoin)
    return swapcoin
