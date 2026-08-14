from fastapi import APIRouter, Depends, Query, status, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from app.database import get_db
from app.schemas.academic import (
    HalqaCreate, HalqaResponse, HalqaEnrollmentCreate, HalqaEnrollmentResponse,
    HifzLogCreate, HifzLogResponse, KitabLogCreate, KitabLogResponse,
    TarbiyyahLogCreate, BulkTarbiyyahCreate, TarbiyyahLogResponse, LeaveRequestCreate, LeaveRequestResponse, LeaveApprovalUpdate,
    NazimDashboardResponse
)
from app.services import academic_dars
from app.core.guards import role_guard

router = APIRouter(prefix="/v1/academic", tags=["Module 3: Academic & Tarbiyyah (Dars Operations)"])

@router.get(
    "/halqa/students",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def get_ustad_halqa_students_endpoint(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    (Ustad / Nazim) Retrieve student roster for the active Ustad's Halqa.
    """
    center_id = getattr(request.state, "center_id", None)
    ustad_id = getattr(request.state, "user_id", None)
    return academic_dars.get_ustad_halqa_students_service(db, ustad_id, center_id)

@router.get(
    "/dashboard/nazim",
    response_model=NazimDashboardResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def get_nazim_dashboard_endpoint(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    (Nazim Only) Fetch operational dashboard statistics for current center.
    Implicitly scoped by Nazim's center_id from JWT token context.
    """
    center_id = getattr(request.state, "center_id", None)
    return academic_dars.get_nazim_dashboard_service(db, center_id)

@router.post(
    "/halqas",
    response_model=HalqaResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def create_halqa_endpoint(payload: HalqaCreate, request: Request, db: Session = Depends(get_db)):
    """(Admin / Nazim Only) Create a new Halqa (batch) for Hifz, Aalim Course, Nazira, or Maktab."""
    center_id = request.state.center_id
    return academic_dars.create_halqa(db, center_id, payload)

@router.get(
    "/halqas",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD", "STUDENT"]))]
)
def get_halqas_endpoint(request: Request, db: Session = Depends(get_db)):
    """Retrieve all active Halqas/Batches for the center."""
    center_id = getattr(request.state, "center_id", None)
    return academic_dars.get_halqas_service(db, center_id)

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
    "/hifz",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def log_hifz_progress(
    log_data: HifzLogCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Record or update a student's daily Hifz progress (Sabaq, Sabqi, Manzil)."""
    center_id = getattr(request.state, "center_id", None)
    ustad_id = getattr(request.state, "user_id", None)
    return academic_dars.record_hifz_log_service(db, center_id, ustad_id, log_data)

@router.post(
    "/hifz/logs",
    response_model=HifzLogResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def record_hifz_log_endpoint(payload: HifzLogCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Record daily Hifz progress (Sabaq, Sabqi, Manzil & Mastery level grades). Triggers Vector DB sync."""
    center_id = request.state.center_id
    ustad_id = request.state.user_id
    return academic_dars.record_hifz_log(db, center_id, ustad_id, payload)

@router.post(
    "/tarbiyyah",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def log_tarbiyyah_attendance(
    log_data: TarbiyyahLogCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Record or update a student's daily prayer attendance and Adab score."""
    return academic_dars.record_tarbiyyah_log_service(db, log_data)

@router.post(
    "/kitab/logs",
    response_model=KitabLogResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def record_kitab_log_endpoint(payload: KitabLogCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Record Kitab progress (book name, chapter, Mutala'a status, comprehension grade)."""
    center_id = request.state.center_id
    ustad_id = request.state.user_id
    return academic_dars.record_kitab_log(db, center_id, ustad_id, payload)

@router.post(
    "/tarbiyyah/bulk",
    response_model=List[TarbiyyahLogResponse],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def log_bulk_tarbiyyah_endpoint(payload: BulkTarbiyyahCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Bulk log daily Tarbiyyah & 5-daily prayer attendance for an entire Halqa with conflict resolution & Vector Sync hook."""
    center_id = request.state.center_id
    user_id = request.state.user_id
    return academic_dars.log_bulk_tarbiyyah(db, center_id, user_id, payload)

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
