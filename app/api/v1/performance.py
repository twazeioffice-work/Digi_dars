from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.schemas.performance import (
    NazimDutyCreate, NazimDutyResponse,
    StudentProgressCardResponse, StaffProgressCardResponse,
    InstitutionPerformanceResponse, LeaderboardResponse
)
from app.services import performance
from app.core.guards import role_guard
from app.core.context import current_tenant_id, current_user_id, current_user_role
from app.models.performance import StudentProgressCard, StaffProgressCard, InstitutionPerformance

router = APIRouter(prefix="/v1/performance", tags=["Performance & Gamification Engine"])

@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard_endpoint(db: Session = Depends(get_db)):
    """Retrieve global institution leaderboard and rankings for current month."""
    return performance.get_global_leaderboard(db)

@router.get("/usthad-rankings")
def get_usthad_rankings_endpoint(db: Session = Depends(get_db)):
    """Retrieve monthly ranking list of all Usthads across centers."""
    return performance.get_usthad_rankings(db)

@router.get("/nazim-rankings")
def get_nazim_rankings_endpoint(db: Session = Depends(get_db)):
    """Retrieve monthly ranking list of all Nazims based on operational duty compliance."""
    return performance.get_nazim_rankings(db)

@router.get("/student-rankings")
def get_student_rankings_endpoint(db: Session = Depends(get_db)):
    """Retrieve top performing student rankings across all centers."""
    return performance.get_student_rankings(db)

@router.post("/trigger-compilation")
def trigger_performance_compilation(
    target_date: Optional[str] = None,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
):
    """(Super Admin Only) Manually trigger monthly performance score compilation."""
    parsed_date = date.fromisoformat(target_date) if target_date else date.today()
    return performance.run_full_monthly_performance_aggregation(db, parsed_date)

@router.get("/duties", response_model=List[NazimDutyResponse])
def get_duties_endpoint(db: Session = Depends(get_db)):
    """Retrieve Nazim administrative duties for current center."""
    center_id = current_tenant_id.get()
    if not center_id:
        return []
    return performance.get_nazim_duties(db, center_id)

@router.post("/duties", response_model=NazimDutyResponse, status_code=status.HTTP_201_CREATED)
def create_duty_endpoint(
    payload: NazimDutyCreate,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "NAZIM", "CENTER_ADMIN"]))]
):
    """Assign a new administrative duty to a center Nazim."""
    center_id = current_tenant_id.get() or payload.center_id
    return performance.create_nazim_duty(db, payload, center_id)

@router.patch("/duties/{duty_id}/complete", response_model=NazimDutyResponse)
def complete_duty_endpoint(duty_id: str, db: Session = Depends(get_db)):
    """Mark a Nazim administrative duty as completed on time."""
    return performance.complete_nazim_duty(db, duty_id)

@router.get("/staff/{user_id}", response_model=List[StaffProgressCardResponse])
def get_staff_cards_endpoint(user_id: str, db: Session = Depends(get_db)):
    """Get historical performance ratings for an Usthad or Nazim."""
    return db.query(StaffProgressCard).filter(
        StaffProgressCard.user_id == user_id
    ).order_by(StaffProgressCard.log_month.desc()).all()

@router.get("/student/{student_id}", response_model=List[StudentProgressCardResponse])
def get_student_cards_endpoint(student_id: str, db: Session = Depends(get_db)):
    """Get historical monthly progress cards for a student."""
    return db.query(StudentProgressCard).filter(
        StudentProgressCard.student_id == student_id
    ).order_by(StudentProgressCard.log_month.desc()).all()
