from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone, date
from typing import Optional, List
from app.models.academic import (
    Halqa, HalqaEnrollment, HifzLog, KitabLog, TarbiyyahLog, LeaveRequest,
    DepartmentType, MasteryLevel, JamaatStatus, LeaveStatus
)
from app.models.auth import User
from app.schemas.academic import (
    HalqaCreate, HalqaEnrollmentCreate, HifzLogCreate,
    KitabLogCreate, BulkTarbiyyahCreate, LeaveRequestCreate
)
from app.services.rag_ai import sync_student_remarks

def create_halqa(db: Session, request_center_id: Optional[str], payload: HalqaCreate) -> Halqa:
    target_center_id = payload.center_id or request_center_id
    if not target_center_id and payload.ustad_id:
        ustad = db.query(User).filter(User.id == payload.ustad_id).first()
        if ustad:
            target_center_id = ustad.center_id

    if not target_center_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid center_id must be provided in the payload or request context"
        )

    ustad = db.query(User).filter(User.id == payload.ustad_id).first() if payload.ustad_id else None
    if payload.ustad_id and not ustad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ustad with id '{payload.ustad_id}' not found"
        )

    dept_upper = payload.department.upper()
    if dept_upper not in [d.value for d in DepartmentType]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid department '{payload.department}'. Allowed: {[d.value for d in DepartmentType]}"
        )

    halqa = Halqa(
        center_id=target_center_id,
        ustad_id=payload.ustad_id or (ustad.id if ustad else None),
        name=payload.name,
        department=dept_upper,
        is_active=True
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

    existing = db.query(HalqaEnrollment).filter(
        HalqaEnrollment.halqa_id == payload.halqa_id,
        HalqaEnrollment.student_id == payload.student_id
    ).first()
    if existing:
        existing.status = payload.status or "ACTIVE"
        db.commit()
        db.refresh(existing)
        return existing

    enrollment = HalqaEnrollment(
        halqa_id=payload.halqa_id,
        student_id=payload.student_id,
        status=payload.status or "ACTIVE"
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

def record_hifz_log(db: Session, center_id: str, ustad_id: str, payload: HifzLogCreate) -> HifzLog:
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{payload.student_id}' not found")

    target_center_id = student.center_id or center_id
    log_date = payload.log_date or datetime.now(timezone.utc).date()

    existing = db.query(HifzLog).filter(
        HifzLog.student_id == payload.student_id,
        HifzLog.log_date == log_date
    ).first()

    if existing:
        existing.sabaq_details = payload.sabaq_details
        existing.sabaq_grade = payload.sabaq_grade
        existing.sabqi_details = payload.sabqi_details
        existing.sabqi_grade = payload.sabqi_grade
        existing.manzil_details = payload.manzil_details
        existing.manzil_grade = payload.manzil_grade
        existing.remarks = payload.remarks
        log_obj = existing
    else:
        log_obj = HifzLog(
            center_id=target_center_id,
            student_id=payload.student_id,
            ustad_id=ustad_id,
            log_date=log_date,
            sabaq_details=payload.sabaq_details,
            sabaq_grade=payload.sabaq_grade,
            sabqi_details=payload.sabqi_details,
            sabqi_grade=payload.sabqi_grade,
            manzil_details=payload.manzil_details,
            manzil_grade=payload.manzil_grade,
            remarks=payload.remarks
        )
        db.add(log_obj)

    db.commit()
    db.refresh(log_obj)

    # Vector Sync Hook: Push remarks to RAG vector DB
    if payload.remarks:
        sync_student_remarks(db, payload.student_id)

    return log_obj

def record_kitab_log(db: Session, center_id: str, ustad_id: str, payload: KitabLogCreate) -> KitabLog:
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{payload.student_id}' not found")

    target_center_id = student.center_id or center_id
    log_date = payload.log_date or datetime.now(timezone.utc).date()

    log_obj = KitabLog(
        center_id=target_center_id,
        student_id=payload.student_id,
        ustad_id=ustad_id,
        log_date=log_date,
        kitab_name=payload.kitab_name,
        chapter_or_topic=payload.chapter_or_topic,
        mutalaa_completed=payload.mutalaa_completed or False,
        comprehension_grade=payload.comprehension_grade,
        remarks=payload.remarks
    )
    db.add(log_obj)
    db.commit()
    db.refresh(log_obj)

    # Vector Sync Hook
    if payload.remarks:
        sync_student_remarks(db, payload.student_id)

    return log_obj

def log_bulk_tarbiyyah(db: Session, center_id: str, user_id: str, payload: BulkTarbiyyahCreate) -> List[TarbiyyahLog]:
    saved_logs = []
    for entry in payload.entries:
        student = db.query(User).filter(User.id == entry.student_id).first()
        if not student:
            continue

        target_center_id = student.center_id or center_id
        log_date = entry.log_date or datetime.now(timezone.utc).date()

        # The "Leave" Override: If on leave, skip prayer statuses
        if entry.is_on_leave:
            fajr, zuhr, asr, maghrib, isha = None, None, None, None, None
        else:
            fajr = entry.fajr or JamaatStatus.PRESENT_IN_JAMAAT.value
            zuhr = entry.zuhr or JamaatStatus.PRESENT_IN_JAMAAT.value
            asr = entry.asr or JamaatStatus.PRESENT_IN_JAMAAT.value
            maghrib = entry.maghrib or JamaatStatus.PRESENT_IN_JAMAAT.value
            isha = entry.isha or JamaatStatus.PRESENT_IN_JAMAAT.value

        existing = db.query(TarbiyyahLog).filter(
            TarbiyyahLog.student_id == entry.student_id,
            TarbiyyahLog.log_date == log_date
        ).first()

        if existing:
            existing.is_on_leave = entry.is_on_leave or False
            existing.fajr = fajr
            existing.zuhr = zuhr
            existing.asr = asr
            existing.maghrib = maghrib
            existing.isha = isha
            existing.adab_score = entry.adab_score
            existing.behavior_remarks = entry.behavior_remarks
            existing.recorded_by = user_id
            log_item = existing
        else:
            log_item = TarbiyyahLog(
                center_id=target_center_id,
                student_id=entry.student_id,
                log_date=log_date,
                is_on_leave=entry.is_on_leave or False,
                fajr=fajr,
                zuhr=zuhr,
                asr=asr,
                maghrib=maghrib,
                isha=isha,
                adab_score=entry.adab_score,
                behavior_remarks=entry.behavior_remarks,
                recorded_by=user_id
            )
            db.add(log_item)

        db.flush()
        saved_logs.append(log_item)

        # Vector Sync Hook
        if entry.behavior_remarks:
            sync_student_remarks(db, entry.student_id)

    db.commit()
    for log_item in saved_logs:
        db.refresh(log_item)
    return saved_logs

def get_student_academic_history(
    db: Session,
    student_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> dict:
    hifz_query = db.query(HifzLog).filter(HifzLog.student_id == student_id)
    kitab_query = db.query(KitabLog).filter(KitabLog.student_id == student_id)
    tarbiyyah_query = db.query(TarbiyyahLog).filter(TarbiyyahLog.student_id == student_id)

    if start_date:
        hifz_query = hifz_query.filter(HifzLog.log_date >= start_date)
        kitab_query = kitab_query.filter(KitabLog.log_date >= start_date)
        tarbiyyah_query = tarbiyyah_query.filter(TarbiyyahLog.log_date >= start_date)
    if end_date:
        hifz_query = hifz_query.filter(HifzLog.log_date <= end_date)
        kitab_query = kitab_query.filter(KitabLog.log_date <= end_date)
        tarbiyyah_query = tarbiyyah_query.filter(TarbiyyahLog.log_date <= end_date)

    return {
        "student_id": student_id,
        "hifz_logs": hifz_query.order_by(HifzLog.log_date.desc()).all(),
        "kitab_logs": kitab_query.order_by(KitabLog.log_date.desc()).all(),
        "tarbiyyah_logs": tarbiyyah_query.order_by(TarbiyyahLog.log_date.desc()).all()
    }

def submit_leave_request(db: Session, request_center_id: Optional[str], payload: LeaveRequestCreate) -> LeaveRequest:
    target_center_id = payload.center_id or request_center_id
    if not target_center_id:
        student = db.query(User).filter(User.id == payload.student_id).first()
        if student:
            target_center_id = student.center_id

    if not target_center_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid center_id must be provided or linked to student"
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
        raise HTTPException(status_code=404, detail=f"Leave request '{request_id}' not found")
    
    status_upper = status_val.upper()
    if status_upper not in [LeaveStatus.APPROVED.value, LeaveStatus.REJECTED.value]:
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")
    
    leave.status = status_upper
    leave.reviewed_by = reviewer_id
    db.commit()
    db.refresh(leave)
    return leave
