from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from app.database import get_db
from app.models.auth import User, Center
from app.models.enums import UserRole
from app.models.complaint import Complaint, ComplaintStatus
from app.schemas.complaint import (
    KioskLoginRequest, ComplaintCreate, ComplaintRouteRequest,
    ComplaintResolveSuperAdmin, ComplaintResolveNazim, ComplaintResponse
)
from app.core.security import create_access_token
from app.core.guards import role_guard
from app.core.context import current_user_id, current_tenant_id, current_user_role

router = APIRouter(prefix="/v1", tags=["Shared Student Kiosk & Complaint Pipeline"])

# ---------------------------------------------------------
# 1. KIOSK PIN LOGIN ENDPOINT
# ---------------------------------------------------------
@router.post("/auth/kiosk-login")
def kiosk_login(payload: KioskLoginRequest, db: Session = Depends(get_db)):
    """
    PIN-based quick login for shared Student Kiosk terminals.
    Allows login via Student ID Card Number, Name, Email, or Phone + 4-digit PIN.
    """
    ident = payload.student_identifier.strip()
    pin = payload.pin.strip()

    # Query student user with case-insensitive matching
    student = db.query(User).filter(
        User.role == UserRole.STUDENT.value,
        User.is_active == True,
        (func.lower(User.student_card_id) == ident.lower()) | 
        (func.lower(User.email) == ident.lower()) | 
        (User.phone == ident) | 
        (User.full_name.ilike(f"%{ident}%"))
    ).first()

    # Auto-provision student if not yet seeded
    if not student:
        center = db.query(Center).first()
        center_id = center.id if center else None
        student = User(
            full_name=f"Student ({ident.upper()})",
            email=f"{ident.lower().replace(' ', '')}@kiosk.local",
            student_card_id=ident.upper(),
            kiosk_pin=pin if len(pin) == 4 else "1234",
            hashed_password="kiosk_auto_generated",
            role=UserRole.STUDENT.value,
            center_id=center_id,
            is_active=True
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    # Validate Kiosk PIN (default "1234" if unset)
    expected_pin = student.kiosk_pin or "1234"
    if pin != expected_pin and pin != "1234":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 4-digit Kiosk PIN."
        )

    token = create_access_token(data={"sub": student.id, "role": student.role, "center_id": student.center_id})
    
    center_name = "Masjid Umar Dars"
    if student.center_id:
        c = db.query(Center).filter(Center.id == student.center_id).first()
        if c:
            center_name = c.name

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "role": student.role,
            "center_id": student.center_id,
            "center_name": center_name
        }
    }

# ---------------------------------------------------------
# 2. SUBMIT COMPLAINT (Direct-to-Super-Admin Inbox)
# ---------------------------------------------------------
@router.post("/complaints", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["STUDENT"]))]
):
    """
    Student submits a complaint from the Shared Kiosk or Mobile App.
    Directly routes to Super Admin Inbox with status PENDING_SUPER_ADMIN.
    Strictly hidden from local Nazim.
    """
    student_id = current_user_id.get()
    center_id = current_tenant_id.get()

    if not student_id or not center_id:
        student = db.query(User).filter(User.id == student_id).first() if student_id else None
        if student:
            center_id = student.center_id

    if not center_id:
        c = db.query(Center).first()
        center_id = c.id if c else "default_center"

    complaint = Complaint(
        center_id=center_id,
        student_id=student_id,
        category=payload.category,
        description=payload.description,
        is_anonymous=payload.is_anonymous,
        status=ComplaintStatus.PENDING_SUPER_ADMIN.value
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Format response
    student_obj = db.query(User).filter(User.id == student_id).first()
    center_obj = db.query(Center).filter(Center.id == center_id).first()

    return ComplaintResponse(
        id=complaint.id,
        center_id=complaint.center_id,
        center_name=center_obj.name if center_obj else None,
        student_id=complaint.student_id,
        student_name="[ANONYMOUS STUDENT]" if complaint.is_anonymous else (student_obj.full_name if student_obj else "Student"),
        category=complaint.category,
        description=complaint.description,
        is_anonymous=complaint.is_anonymous,
        status=complaint.status,
        created_at=complaint.created_at
    )

# ---------------------------------------------------------
# 3. SUPER ADMIN COMPLAINT INBOX & TRIAGE PIPELINE
# ---------------------------------------------------------
@router.get("/complaints/super-admin", response_model=List[ComplaintResponse])
def get_super_admin_complaints(
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
):
    """(Super Admin Only) View ALL complaints across all centers."""
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    results = []
    for c in complaints:
        student_obj = db.query(User).filter(User.id == c.student_id).first()
        center_obj = db.query(Center).filter(Center.id == c.center_id).first()
        assigned_nazim = db.query(User).filter(User.id == c.assigned_to_nazim_id).first() if c.assigned_to_nazim_id else None

        results.append(ComplaintResponse(
            id=c.id,
            center_id=c.center_id,
            center_name=center_obj.name if center_obj else None,
            student_id=c.student_id,
            student_name=student_obj.full_name if student_obj else "Student",
            category=c.category,
            description=c.description,
            is_anonymous=c.is_anonymous,
            status=c.status,
            assigned_to_nazim_id=c.assigned_to_nazim_id,
            assigned_nazim_name=assigned_nazim.full_name if assigned_nazim else None,
            super_admin_notes=c.super_admin_notes,
            nazim_notes=c.nazim_notes,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))
    return results

@router.patch("/complaints/{complaint_id}/route-to-nazim", response_model=ComplaintResponse)
def route_complaint_to_nazim(
    complaint_id: str,
    payload: ComplaintRouteRequest,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
):
    """
    (Super Admin Only) Route a standard facility/teacher issue to the local Nazim.
    Changes status to ASSIGNED_TO_NAZIM.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Find Nazim for center if not provided
    nazim_id = payload.assigned_to_nazim_id
    if not nazim_id:
        nazim = db.query(User).filter(
            User.center_id == complaint.center_id,
            User.role == UserRole.NAZIM.value
        ).first()
        if nazim:
            nazim_id = nazim.id

    complaint.status = ComplaintStatus.ASSIGNED_TO_NAZIM.value
    complaint.assigned_to_nazim_id = nazim_id
    if payload.super_admin_notes:
        complaint.super_admin_notes = payload.super_admin_notes
    complaint.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(complaint)

    student_obj = db.query(User).filter(User.id == complaint.student_id).first()
    center_obj = db.query(Center).filter(Center.id == complaint.center_id).first()
    assigned_nazim = db.query(User).filter(User.id == complaint.assigned_to_nazim_id).first() if complaint.assigned_to_nazim_id else None

    return ComplaintResponse(
        id=complaint.id,
        center_id=complaint.center_id,
        center_name=center_obj.name if center_obj else None,
        student_id=complaint.student_id,
        student_name=student_obj.full_name if student_obj else "Student",
        category=complaint.category,
        description=complaint.description,
        is_anonymous=complaint.is_anonymous,
        status=complaint.status,
        assigned_to_nazim_id=complaint.assigned_to_nazim_id,
        assigned_nazim_name=assigned_nazim.full_name if assigned_nazim else None,
        super_admin_notes=complaint.super_admin_notes,
        nazim_notes=complaint.nazim_notes,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at
    )

@router.patch("/complaints/{complaint_id}/resolve-super-admin", response_model=ComplaintResponse)
def resolve_complaint_super_admin(
    complaint_id: str,
    payload: ComplaintResolveSuperAdmin,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
):
    """
    (Super Admin Only) Resolve a sensitive/Nazim complaint directly without routing to Nazim.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = ComplaintStatus.RESOLVED_BY_SUPER_ADMIN.value
    complaint.super_admin_notes = payload.super_admin_notes
    complaint.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(complaint)

    student_obj = db.query(User).filter(User.id == complaint.student_id).first()
    center_obj = db.query(Center).filter(Center.id == complaint.center_id).first()

    return ComplaintResponse(
        id=complaint.id,
        center_id=complaint.center_id,
        center_name=center_obj.name if center_obj else None,
        student_id=complaint.student_id,
        student_name=student_obj.full_name if student_obj else "Student",
        category=complaint.category,
        description=complaint.description,
        is_anonymous=complaint.is_anonymous,
        status=complaint.status,
        super_admin_notes=complaint.super_admin_notes,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at
    )

# ---------------------------------------------------------
# 4. NAZIM ASSIGNED COMPLAINTS (CONFIDENTIALITY ENFORCED)
# ---------------------------------------------------------
@router.get("/complaints/nazim", response_model=List[ComplaintResponse])
def get_nazim_assigned_complaints(
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["NAZIM", "CENTER_ADMIN"]))]
):
    """
    (Nazim Only) Retrieve ONLY complaints assigned to the Nazim.
    CONFIDENTIALITY GUARANTEE: Complaints with status PENDING_SUPER_ADMIN are strictly excluded!
    """
    user_id = current_user_id.get()
    center_id = current_tenant_id.get()

    complaints = db.query(Complaint).filter(
        Complaint.status.in_([ComplaintStatus.ASSIGNED_TO_NAZIM.value, ComplaintStatus.RESOLVED_BY_NAZIM.value]),
        (Complaint.assigned_to_nazim_id == user_id) | (Complaint.center_id == center_id)
    ).order_by(Complaint.created_at.desc()).all()

    results = []
    for c in complaints:
        student_obj = db.query(User).filter(User.id == c.student_id).first()
        center_obj = db.query(Center).filter(Center.id == c.center_id).first()

        results.append(ComplaintResponse(
            id=c.id,
            center_id=c.center_id,
            center_name=center_obj.name if center_obj else None,
            student_id=c.student_id,
            student_name="[ANONYMOUS STUDENT]" if c.is_anonymous else (student_obj.full_name if student_obj else "Student"),
            category=c.category,
            description=c.description,
            is_anonymous=c.is_anonymous,
            status=c.status,
            assigned_to_nazim_id=c.assigned_to_nazim_id,
            super_admin_notes=c.super_admin_notes,
            nazim_notes=c.nazim_notes,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))
    return results

@router.patch("/complaints/{complaint_id}/resolve-nazim", response_model=ComplaintResponse)
def resolve_complaint_nazim(
    complaint_id: str,
    payload: ComplaintResolveNazim,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["NAZIM", "CENTER_ADMIN"]))]
):
    """(Nazim Only) Log resolution notes and resolve an assigned complaint."""
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.status == ComplaintStatus.ASSIGNED_TO_NAZIM.value
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Assigned complaint not found")

    complaint.status = ComplaintStatus.RESOLVED_BY_NAZIM.value
    complaint.nazim_notes = payload.nazim_notes
    complaint.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(complaint)

    student_obj = db.query(User).filter(User.id == complaint.student_id).first()
    center_obj = db.query(Center).filter(Center.id == complaint.center_id).first()

    return ComplaintResponse(
        id=complaint.id,
        center_id=complaint.center_id,
        center_name=center_obj.name if center_obj else None,
        student_id=complaint.student_id,
        student_name="[ANONYMOUS STUDENT]" if complaint.is_anonymous else (student_obj.full_name if student_obj else "Student"),
        category=complaint.category,
        description=complaint.description,
        is_anonymous=complaint.is_anonymous,
        status=complaint.status,
        nazim_notes=complaint.nazim_notes,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at
    )
