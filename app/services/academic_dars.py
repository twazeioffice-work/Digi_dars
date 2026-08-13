from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone, date
from typing import Optional
from app.models.academic import Halqa, HalqaEnrollment, HifzProgress, KitabProgress, DailyTarbiyyah, LeaveRequest, LeaveStatus
from app.models.auth import User, UserRole
from app.schemas.academic import (
    HalqaCreate, HalqaEnrollmentCreate, HifzProgressCreate,
    KitabProgressCreate, DailyTarbiyyahCreate, LeaveRequestCreate
)

def create_halqa(db: Session, request_center_id: Optional[str], payload: HalqaCreate) -> Halqa:
    target_center_id = payload.center_id or request_center_id
    if payload.ustad_id and not target_center_id:
        ustad = db.query(User).filter(User.id == payload.ustad_id).first()
        if ustad:
            target_center_id = ustad.center_id

    if not target_center_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid center_id must be provided in the payload or request context"
        )

    if payload.ustad_id:
        ustad = db.query(User).filter(User.id == payload.ustad_id).first()
        if not ustad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ustad with id '{payload.ustad_id}' not found"
            )

    halqa = Halqa(
        center_id=target_center_id,
        name=payload.name,
        department=payload.department,
        ustad_id=payload.ustad_id
    )
    db.add(halqa)
    db.commit()
    db.refresh(halqa)
    return halqa

def enroll_student_in_halqa(db: Session, payload: HalqaEnrollmentCreate) -> HalqaEnrollment:
    halqa = db.query(Halqa).filter(Halqa.id == payload.halqa_id).first()
    if not halqa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Halqa '{payload.halqa_id}' not found"
        )
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{payload.student_id}' not found"
        )

    enrollment = HalqaEnrollment(
        halqa_id=payload.halqa_id,
        student_id=payload.student_id
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

def record_hifz_progress(db: Session, ustad_id: str, payload: HifzProgressCreate) -> HifzProgress:
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{payload.student_id}' not found"
        )

    log_date = payload.log_date or datetime.now(timezone.utc).date()
    progress = HifzProgress(
        student_id=payload.student_id,
        ustad_id=ustad_id,
        log_date=log_date,
        sabaq=payload.sabaq,
        sabqi=payload.sabqi,
        manzil=payload.manzil,
        remarks=payload.remarks
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress

def record_kitab_progress(db: Session, ustad_id: str, payload: KitabProgressCreate) -> KitabProgress:
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{payload.student_id}' not found"
        )

    log_date = payload.log_date or datetime.now(timezone.utc).date()
    progress = KitabProgress(
        student_id=payload.student_id,
        ustad_id=ustad_id,
        log_date=log_date,
        book_name=payload.book_name,
        chapter_completed=payload.chapter_completed,
        pages_read=payload.pages_read or 0,
        remarks=payload.remarks
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress

def get_student_academic_history(
    db: Session,
    student_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> dict:
    hifz_query = db.query(HifzProgress).filter(HifzProgress.student_id == student_id)
    kitab_query = db.query(KitabProgress).filter(KitabProgress.student_id == student_id)
    tarbiyyah_query = db.query(DailyTarbiyyah).filter(DailyTarbiyyah.student_id == student_id)

    if start_date:
        hifz_query = hifz_query.filter(HifzProgress.log_date >= start_date)
        kitab_query = kitab_query.filter(KitabProgress.log_date >= start_date)
        tarbiyyah_query = tarbiyyah_query.filter(DailyTarbiyyah.log_date >= start_date)
    if end_date:
        hifz_query = hifz_query.filter(HifzProgress.log_date <= end_date)
        kitab_query = kitab_query.filter(KitabProgress.log_date <= end_date)
        tarbiyyah_query = tarbiyyah_query.filter(DailyTarbiyyah.log_date <= end_date)

    return {
        "student_id": student_id,
        "hifz_logs": hifz_query.order_by(HifzProgress.log_date.desc()).all(),
        "kitab_logs": kitab_query.order_by(KitabProgress.log_date.desc()).all(),
        "tarbiyyah_logs": tarbiyyah_query.order_by(DailyTarbiyyah.log_date.desc()).all()
    }

def log_daily_tarbiyyah(db: Session, ustad_id: str, payload: DailyTarbiyyahCreate) -> DailyTarbiyyah:
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{payload.student_id}' not found"
        )

    log_date = payload.log_date or datetime.now(timezone.utc).date()
    tarbiyyah = DailyTarbiyyah(
        student_id=payload.student_id,
        ustad_id=ustad_id,
        log_date=log_date,
        fajr=payload.fajr or "PRESENT_JAMAAT",
        dhuhr=payload.dhuhr or "PRESENT_JAMAAT",
        asr=payload.asr or "PRESENT_JAMAAT",
        maghrib=payload.maghrib or "PRESENT_JAMAAT",
        isha=payload.isha or "PRESENT_JAMAAT",
        behavioral_remarks=payload.behavioral_remarks
    )
    db.add(tarbiyyah)
    db.commit()
    db.refresh(tarbiyyah)
    return tarbiyyah

def submit_leave_request(db: Session, request_center_id: Optional[str], payload: LeaveRequestCreate) -> LeaveRequest:
    target_center_id = payload.center_id or request_center_id
    if not target_center_id:
        student = db.query(User).filter(User.id == payload.student_id).first()
        if student:
            target_center_id = student.center_id

    if not target_center_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid center_id must be provided or linked to the student"
        )

    leave = LeaveRequest(
        student_id=payload.student_id,
        center_id=target_center_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status=LeaveStatus.PENDING.value
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

def approve_leave_request(db: Session, request_id: str, reviewer_id: str, status_val: str) -> LeaveRequest:
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leave request '{request_id}' not found"
        )
    status_upper = status_val.upper()
    if status_upper not in [LeaveStatus.APPROVED.value, LeaveStatus.REJECTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be APPROVED or REJECTED"
        )
    leave.status = status_upper
    leave.reviewed_by = reviewer_id
    db.commit()
    db.refresh(leave)
    return leave
