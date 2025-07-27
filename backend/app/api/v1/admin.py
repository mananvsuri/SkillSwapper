from fastapi import Depends, HTTPException, status, Header, APIRouter, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import csv
import io
import json
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models import User, Skill, Swap, Rating, PlatformMessage
from app.schemas.admin import (
    AdminUserResponse, AdminSkillResponse, AdminSwapResponse,
    BanUserRequest, UnbanUserRequest, RejectSkillRequest, ApproveSkillRequest,
    PlatformMessageRequest, AdminStatsResponse, ReportRequest, AdminDashboardResponse
)

admin_router = APIRouter()

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

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@admin_router.get("/admin/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    """Get admin dashboard with stats and recent data"""
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_banned == False).count()
    banned_users = db.query(User).filter(User.is_banned == True).count()
    total_swaps = db.query(Swap).count()
    pending_swaps = db.query(Swap).filter(Swap.status == "pending").count()
    completed_swaps = db.query(Swap).filter(Swap.status == "completed").count()
    total_skills = db.query(Skill).count()
    pending_skills = db.query(Skill).filter(Skill.status == "pending").count()
    total_ratings = db.query(Rating).count()
    
    avg_rating_result = db.query(func.avg(Rating.stars)).scalar()
    average_rating = float(avg_rating_result) if avg_rating_result else 0.0
    
    stats = AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        banned_users=banned_users,
        total_swaps=total_swaps,
        pending_swaps=pending_swaps,
        completed_swaps=completed_swaps,
        total_skills=total_skills,
        pending_skills=pending_skills,
        total_ratings=total_ratings,
        average_rating=average_rating
    )
    
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    recent_swaps = db.query(Swap).order_by(Swap.created_at.desc()).limit(10).all()
    pending_skills_list = db.query(Skill).filter(Skill.status == "pending").limit(10).all()
    
    return AdminDashboardResponse(
        stats=stats,
        recent_users=recent_users,
        recent_swaps=recent_swaps,
        pending_skills=pending_skills_list
    )

@admin_router.get("/admin/users", response_model=List[AdminUserResponse])
def get_all_users(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db), 
    _: User = Depends(get_admin_user)
):
    """Get all users with filtering options"""
    query = db.query(User)
    
    if status == "banned":
        query = query.filter(User.is_banned == True)
    elif status == "active":
        query = query.filter(User.is_banned == False)
    
    users = query.offset(skip).limit(limit).all()
    
    enhanced_users = []
    for user in users:
        total_swaps = db.query(Swap).filter(
            or_(Swap.from_user_id == user.id, Swap.to_user_id == user.id)
        ).count()
        
        total_skills = db.query(Skill).filter(Skill.user_id == user.id).count()
        
        avg_rating = db.query(func.avg(Rating.stars)).filter(Rating.to_user_id == user.id).scalar()
        average_rating = float(avg_rating) if avg_rating else 0.0
        
        enhanced_users.append(AdminUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            location=user.location,
            is_public=user.is_public,
            is_admin=user.is_admin,
            is_banned=user.is_banned,
            created_at=user.created_at,
            last_login=user.last_login,
            total_swaps=total_swaps,
            total_skills=total_skills,
            average_rating=average_rating
        ))
    
    return enhanced_users

@admin_router.post("/admin/users/ban")
def ban_user(request: BanUserRequest, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    """Ban a user"""
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot ban admin users")
    
    user.is_banned = True
    db.commit()
    
    return {"message": f"User {user.email} has been banned. Reason: {request.reason}"}

@admin_router.post("/admin/users/unban")
def unban_user(request: UnbanUserRequest, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    """Unban a user"""
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_banned = False
    db.commit()
    
    return {"message": f"User {user.email} has been unbanned"}

@admin_router.get("/admin/skills", response_model=List[AdminSkillResponse])
def get_all_skills(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db), 
    _: User = Depends(get_admin_user)
):
    """Get all skills with filtering options"""
    query = db.query(Skill).join(User)
    
    if status:
        query = query.filter(Skill.status == status)
    
    skills = query.offset(skip).limit(limit).all()
    
    enhanced_skills = []
    for skill in skills:
        enhanced_skills.append(AdminSkillResponse(
            id=skill.id,
            name=skill.name,
            type=skill.type.value,
            level=skill.level.value,
            user_id=skill.user_id,
            user_name=skill.user.name,
            user_email=skill.user.email,
            status=skill.status.value,
            created_at=skill.created_at
        ))
    
    return enhanced_skills

@admin_router.post("/admin/skills/reject")
def reject_skill(request: RejectSkillRequest, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    """Reject a skill"""
    skill = db.query(Skill).filter(Skill.id == request.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    skill.status = "rejected"
    db.commit()
    
    return {"message": f"Skill '{skill.name}' has been rejected. Reason: {request.reason}"}

@admin_router.post("/admin/skills/approve")
def approve_skill(request: ApproveSkillRequest, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    """Approve a skill"""
    skill = db.query(Skill).filter(Skill.id == request.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    skill.status = "approved"
    db.commit()
    
    return {"message": f"Skill '{skill.name}' has been approved"}

@admin_router.get("/admin/swaps", response_model=List[AdminSwapResponse])
def get_all_swaps(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db), 
    _: User = Depends(get_admin_user)
):
    """Get all swaps with filtering options"""
    query = db.query(Swap)
    
    if status:
        query = query.filter(Swap.status == status)
    
    swaps = query.offset(skip).limit(limit).all()
    
    enhanced_swaps = []
    for swap in swaps:
        from_user = db.query(User).filter(User.id == swap.from_user_id).first()
        to_user = db.query(User).filter(User.id == swap.to_user_id).first()
        skill_offered = db.query(Skill).filter(Skill.id == swap.skill_offered_id).first()
        skill_requested = db.query(Skill).filter(Skill.id == swap.skill_requested_id).first()
        
        enhanced_swaps.append(AdminSwapResponse(
            id=swap.id,
            from_user_id=swap.from_user_id,
            to_user_id=swap.to_user_id,
            skill_offered_id=swap.skill_offered_id,
            skill_requested_id=swap.skill_requested_id,
            status=swap.status,
            from_user_name=from_user.name if from_user else "Unknown",
            to_user_name=to_user.name if to_user else "Unknown",
            skill_offered_name=skill_offered.name if skill_offered else "Unknown",
            skill_requested_name=skill_requested.name if skill_requested else "Unknown",
            created_at=swap.created_at,
            updated_at=swap.updated_at
        ))
    
    return enhanced_swaps

@admin_router.post("/admin/messages")
def create_platform_message(
    request: PlatformMessageRequest, 
    db: Session = Depends(get_db), 
    admin: User = Depends(get_admin_user)
):
    """Create a platform-wide message"""
    message = PlatformMessage(
        title=request.title,
        message=request.message,
        message_type=request.message_type,
        created_by=admin.id
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return {"message": "Platform message created successfully", "id": message.id}

@admin_router.get("/admin/messages")
def get_platform_messages(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db), 
    _: User = Depends(get_admin_user)
):
    """Get all platform messages"""
    messages = db.query(PlatformMessage).order_by(PlatformMessage.created_at.desc()).offset(skip).limit(limit).all()
    return messages

@admin_router.delete("/admin/messages/{message_id}")
def delete_platform_message(
    message_id: int,
    db: Session = Depends(get_db), 
    _: User = Depends(get_admin_user)
):
    """Delete a platform message"""
    message = db.query(PlatformMessage).filter(PlatformMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(message)
    db.commit()
    
    return {"message": "Platform message deleted successfully"}

@admin_router.post("/admin/reports")
def generate_report(
    request: ReportRequest,
    db: Session = Depends(get_db), 
    _: User = Depends(get_admin_user)
):
    """Generate reports in various formats"""
    
    start_date = request.start_date or datetime.now() - timedelta(days=30)
    end_date = request.end_date or datetime.now()
    
    if request.report_type == "users":
        data = db.query(User).filter(
            and_(User.created_at >= start_date, User.created_at <= end_date)
        ).all()
        
        if request.format == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["ID", "Name", "Email", "Location", "Is Admin", "Is Banned", "Created At"])
            
            for user in data:
                writer.writerow([
                    user.id, user.name, user.email, user.location,
                    user.is_admin, user.is_banned, user.created_at
                ])
            
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=users_report_{datetime.now().strftime('%Y%m%d')}.csv"}
            )
        else:
            return [{"id": u.id, "name": u.name, "email": u.email, "created_at": u.created_at} for u in data]
    
    elif request.report_type == "swaps":
        data = db.query(Swap).filter(
            and_(Swap.created_at >= start_date, Swap.created_at <= end_date)
        ).all()
        
        if request.format == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["ID", "From User", "To User", "Status", "Created At"])
            
            for swap in data:
                from_user = db.query(User).filter(User.id == swap.from_user_id).first()
                to_user = db.query(User).filter(User.id == swap.to_user_id).first()
                writer.writerow([
                    swap.id, 
                    from_user.name if from_user else "Unknown",
                    to_user.name if to_user else "Unknown",
                    swap.status, swap.created_at
                ])
            
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=swaps_report_{datetime.now().strftime('%Y%m%d')}.csv"}
            )
        else:
            return [{"id": s.id, "status": s.status, "created_at": s.created_at} for s in data]
    
    elif request.report_type == "skills":
        data = db.query(Skill).filter(
            and_(Skill.created_at >= start_date, Skill.created_at <= end_date)
        ).all()
        
        if request.format == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["ID", "Name", "Type", "Level", "User", "Status", "Created At"])
            
            for skill in data:
                user = db.query(User).filter(User.id == skill.user_id).first()
                writer.writerow([
                    skill.id, skill.name, skill.type.value, skill.level.value,
                    user.name if user else "Unknown", skill.status.value, skill.created_at
                ])
            
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=skills_report_{datetime.now().strftime('%Y%m%d')}.csv"}
            )
        else:
            return [{"id": s.id, "name": s.name, "type": s.type.value, "status": s.status.value} for s in data]
    
    elif request.report_type == "ratings":
        data = db.query(Rating).filter(
            and_(Rating.created_at >= start_date, Rating.created_at <= end_date)
        ).all()
        
        if request.format == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["ID", "From User", "To User", "Stars", "Feedback", "Created At"])
            
            for rating in data:
                from_user = db.query(User).filter(User.id == rating.from_user_id).first()
                to_user = db.query(User).filter(User.id == rating.to_user_id).first()
                writer.writerow([
                    rating.id,
                    from_user.name if from_user else "Unknown",
                    to_user.name if to_user else "Unknown",
                    rating.stars, rating.feedback, rating.created_at
                ])
            
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=ratings_report_{datetime.now().strftime('%Y%m%d')}.csv"}
            )
        else:
            return [{"id": r.id, "stars": r.stars, "feedback": r.feedback, "created_at": r.created_at} for r in data]
    
    else:
        raise HTTPException(status_code=400, detail="Invalid report type")

@admin_router.get("/admin/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    """Get comprehensive platform statistics"""
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_banned == False).count()
    banned_users = db.query(User).filter(User.is_banned == True).count()
    total_swaps = db.query(Swap).count()
    pending_swaps = db.query(Swap).filter(Swap.status == "pending").count()
    completed_swaps = db.query(Swap).filter(Swap.status == "completed").count()
    total_skills = db.query(Skill).count()
    pending_skills = db.query(Skill).filter(Skill.status == "pending").count()
    total_ratings = db.query(Rating).count()
    
    avg_rating_result = db.query(func.avg(Rating.stars)).scalar()
    average_rating = float(avg_rating_result) if avg_rating_result else 0.0
    
    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        banned_users=banned_users,
        total_swaps=total_swaps,
        pending_swaps=pending_swaps,
        completed_swaps=completed_swaps,
        total_skills=total_skills,
        pending_skills=pending_skills,
        total_ratings=total_ratings,
        average_rating=average_rating
    ) 