from fastapi import APIRouter, Depends, Query, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.database import get_db
from app.schemas.academic import (
    HalqaCreate, HalqaResponse, HalqaEnrollmentCreate, HalqaEnrollmentResponse,
    HifzProgressCreate, HifzProgressResponse, KitabProgressCreate, KitabProgressResponse,
    DailyTarbiyyahCreate, DailyTarbiyyahResponse, LeaveRequestCreate, LeaveRequestResponse, LeaveApprovalUpdate
)
from app.services import academic_dars
from app.core.guards import role_guard

router = APIRouter(prefix="/v1/academic", tags=["Module 3: Academic & Tarbiyyah (Dars Operations)"])

@router.post(
    "/halqas",
    response_model=HalqaResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def create_halqa_endpoint(payload: HalqaCreate, request: Request, db: Session = Depends(get_db)):
    """(Admin / Nazim Only) Create a new Halqa (batch)."""
    center_id = request.state.center_id
    return academic_dars.create_halqa(db, center_id, payload)

@router.post(
    "/halqas/enroll",
    response_model=HalqaEnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def enroll_student_endpoint(payload: HalqaEnrollmentCreate, db: Session = Depends(get_db)):
    """Enroll a student into a Halqa."""
    return academic_dars.enroll_student_in_halqa(db, payload)

@router.post(
    "/hifz/progress",
    response_model=HifzProgressResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def record_hifz_progress_endpoint(payload: HifzProgressCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Record daily Hifz progress (Sabaq, Sabqi, Manzil)."""
    ustad_id = request.state.user_id
    return academic_dars.record_hifz_progress(db, ustad_id, payload)

@router.post(
    "/kitab/progress",
    response_model=KitabProgressResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def record_kitab_progress_endpoint(payload: KitabProgressCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Record daily Kitab progress (book name, chapters completed)."""
    ustad_id = request.state.user_id
    return academic_dars.record_kitab_progress(db, ustad_id, payload)

@router.get(
    "/students/{student_id}/history",
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD", "PARENT", "STUDENT"]))]
)
def get_student_academic_history_endpoint(
    student_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve full academic and Tarbiyyah history for a student."""
    return academic_dars.get_student_academic_history(db, student_id, start_date, end_date)

@router.post(
    "/tarbiyyah",
    response_model=DailyTarbiyyahResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def log_daily_tarbiyyah_endpoint(payload: DailyTarbiyyahCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Log daily prayer attendance and behavioral remarks."""
    ustad_id = request.state.user_id
    return academic_dars.log_daily_tarbiyyah(db, ustad_id, payload)

@router.post(
    "/leave-requests",
    response_model=LeaveRequestResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD", "PARENT", "STUDENT"]))]
)
def submit_leave_request_endpoint(payload: LeaveRequestCreate, request: Request, db: Session = Depends(get_db)):
    """Submit a leave request (Chutti)."""
    center_id = request.state.center_id
    return academic_dars.submit_leave_request(db, center_id, payload)

@router.patch(
    "/leave-requests/{request_id}/approve",
    response_model=LeaveRequestResponse,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def approve_leave_request_endpoint(
    request_id: str,
    payload: LeaveApprovalUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """(Nazim / Ustad Only) Approve or reject a leave request."""
    reviewer_id = request.state.user_id
    return academic_dars.approve_leave_request(db, request_id, reviewer_id, payload.status)
