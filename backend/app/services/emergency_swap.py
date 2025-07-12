from sqlalchemy.orm import Session
from app.models.swap import Swap, SwapStatus


def suggest_replacement_swaps(current_user_id: int, db: Session):
    available_swaps = db.query(Swap).filter(
        Swap.status == SwapStatus.pending,
        Swap.to_user_id != current_user_id
    ).all()
    return available_swaps[:3]
