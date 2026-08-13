from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class NazimDutyCreate(BaseModel):
    center_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: date

class NazimDutyResponse(BaseModel):
    id: str
    center_id: str
    title: str
    description: Optional[str] = None
    due_date: date
    is_completed: bool
    completed_at: Optional[date] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentProgressCardResponse(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    center_id: str
    log_month: date
    namaz_score: float
    hygiene_score: float
    study_score: float
    chores_score: float
    overall_score: float

    model_config = ConfigDict(from_attributes=True)

class StaffProgressCardResponse(BaseModel):
    id: str
    user_id: str
    staff_name: Optional[str] = None
    center_id: str
    role: str
    log_month: date
    performance_score: float
    penalty_points: float
    final_rating: float

    model_config = ConfigDict(from_attributes=True)

class InstitutionPerformanceResponse(BaseModel):
    id: str
    center_id: str
    center_name: Optional[str] = None
    center_code: Optional[str] = None
    log_month: date
    avg_student_score: float
    avg_usthad_score: float
    nazim_duty_score: float
    total_institution_score: float
    global_rank: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class LeaderboardItem(BaseModel):
    center_id: str
    center_name: str
    center_code: str
    global_rank: int
    total_institution_score: float
    avg_student_score: float
    avg_usthad_score: float
    nazim_duty_score: float
    log_month: date

class LeaderboardResponse(BaseModel):
    current_month: date
    leaderboard: List[LeaderboardItem]
