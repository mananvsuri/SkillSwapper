from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class AdminAction(str, Enum):
    BAN = "ban"
    UNBAN = "unban"
    REJECT_SKILL = "reject_skill"
    APPROVE_SKILL = "approve_skill"

class UserStatus(str, Enum):
    ACTIVE = "active"
    BANNED = "banned"
    PENDING = "pending"

class SkillStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class SwapStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    location: Optional[str] = None
    is_public: bool
    is_admin: bool
    is_banned: bool
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    total_swaps: int = 0
    total_skills: int = 0
    average_rating: float = 0.0

    class Config:
        from_attributes = True

class AdminSkillResponse(BaseModel):
    id: int
    name: str
    type: str
    level: str
    user_id: int
    user_name: str
    user_email: str
    status: SkillStatus = SkillStatus.APPROVED
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AdminSwapResponse(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    skill_offered_id: int
    skill_requested_id: int
    status: SwapStatus
    from_user_name: str
    to_user_name: str
    skill_offered_name: str
    skill_requested_name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BanUserRequest(BaseModel):
    user_id: int
    reason: str

class UnbanUserRequest(BaseModel):
    user_id: int

class RejectSkillRequest(BaseModel):
    skill_id: int
    reason: str

class ApproveSkillRequest(BaseModel):
    skill_id: int

class PlatformMessageRequest(BaseModel):
    title: str
    message: str
    message_type: str = "info"  # info, warning, error, success

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    banned_users: int
    total_swaps: int
    pending_swaps: int
    completed_swaps: int
    total_skills: int
    pending_skills: int
    total_ratings: int
    average_rating: float

class ReportRequest(BaseModel):
    report_type: str  # users, swaps, skills, ratings
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    format: str = "json"  # json, csv

class AdminDashboardResponse(BaseModel):
    stats: AdminStatsResponse
    recent_users: List[AdminUserResponse]
    recent_swaps: List[AdminSwapResponse]
    pending_skills: List[AdminSkillResponse] 