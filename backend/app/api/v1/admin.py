from fastapi import Depends, HTTPException, status, Header, APIRouter
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User
from app.models.skill import Skill
from app.models.swap import Swap
from app.models.rating import Rating
from app.schemas.user import UserResponse

admin_router = APIRouter()

# === Dependency: DB session ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === Dependency: Authenticated User ===
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

# === Dependency: Admin-Only Access ===
def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# === Admin APIs ===
@admin_router.get("/admin/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(User).all()

@admin_router.get("/admin/swaps")
def get_all_swaps(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(Swap).all()

@admin_router.get("/admin/skills")
def get_all_skills(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(Skill).all()

@admin_router.get("/admin/ratings")
def get_all_ratings(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(Rating).all()

@admin_router.delete("/admin/ban/{user_id}")
def ban_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} banned and deleted."}
