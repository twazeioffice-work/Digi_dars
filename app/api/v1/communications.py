from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.communication import (
    InternalTicketCreate, InternalTicketResponseWrapper, TicketStatusUpdate,
    BroadcastCreate, BroadcastResponseWrapper,
    AcademicMessageCreate, AcademicMessageResponseWrapper, ApprovedReportRequest, MessageResponse,
    ProgressMessageCreate, ProgressReplyCreate,
    EscalationCreate, EscalationResponseWrapper,
    InquiryCreate, InquiryResponse
)
from app.services import communications
from app.core.guards import role_guard

router = APIRouter(prefix="/v1/communication", tags=["Module 4: 4-Way Communication & Ticketing"])
plural_router = APIRouter(prefix="/v1/communications", tags=["Communications"])

# Flow 1: Internal Tickets (Ustad ➝ Nazim)
@router.post(
    "/internal-tickets",
    response_model=InternalTicketResponseWrapper,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["USTAD", "NAZIM", "CENTER_ADMIN", "SUPER_ADMIN"]))]
)
def create_internal_ticket_endpoint(payload: InternalTicketCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad / Nazim) Create an internal staff ticket for supplies, maintenance, or administrative issues."""
    created_by = getattr(request.state, "user_id", None)
    center_id = getattr(request.state, "center_id", None)
    return communications.create_internal_ticket(db, created_by, center_id, payload)

@router.patch(
    "/internal-tickets/{ticket_id}/status",
    dependencies=[Depends(role_guard(["NAZIM", "CENTER_ADMIN", "SUPER_ADMIN"]))]
)
def update_ticket_status_endpoint(ticket_id: str, payload: TicketStatusUpdate, db: Session = Depends(get_db)):
    """(Nazim / Admin Only) Update the status of an internal ticket."""
    return communications.update_ticket_status(db, ticket_id, payload.status)

# Flow 2: Broadcasts (Nazim ➝ Parents)
@router.post(
    "/broadcasts",
    response_model=BroadcastResponseWrapper,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["NAZIM", "CENTER_ADMIN", "SUPER_ADMIN"]))]
)
def send_broadcast_endpoint(payload: BroadcastCreate, request: Request, db: Session = Depends(get_db)):
    """(Nazim / Admin Only) Publish a broadcast announcement to all parents, department parents, or specific Halqa."""
    sent_by = getattr(request.state, "user_id", None)
    center_id = getattr(request.state, "center_id", None)
    return communications.create_broadcast(db, sent_by, center_id, payload)

# Flow 3: Academic Direct Messaging & Approved Report Dispatch
@router.post(
    "/students/{student_id}/report",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["USTAD", "NAZIM", "CENTER_ADMIN", "SUPER_ADMIN"]))]
)
def dispatch_approved_report(
    student_id: str,
    payload: ApprovedReportRequest,
    db: Session = Depends(get_db)
):
    """
    Saves the final approved AI report to the parent inbox thread 
    and triggers an async push notification.
    """
    return communications.send_approved_report_service(db, student_id, payload)

@plural_router.post(
    "/students/{student_id}/report",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["USTAD", "NAZIM", "CENTER_ADMIN", "SUPER_ADMIN"]))]
)
def dispatch_approved_report_plural(
    student_id: str,
    payload: ApprovedReportRequest,
    db: Session = Depends(get_db)
):
    """
    Saves the final approved AI report to the parent inbox thread 
    and triggers an async push notification.
    """
    return communications.send_approved_report_service(db, student_id, payload)

@router.post(
    "/threads/{thread_id}/messages",
    response_model=AcademicMessageResponseWrapper,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["USTAD", "PARENT", "STUDENT", "SUPER_ADMIN"]))]
)
def send_academic_message_endpoint(
    thread_id: str,
    payload: AcademicMessageCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """(Ustad / Parent) Send a direct message in an academic chat thread."""
    sender_id = getattr(request.state, "user_id", None)
    return communications.send_academic_message(db, thread_id, sender_id, payload)

@router.post(
    "/progress-updates",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["USTAD", "SUPER_ADMIN"]))]
)
def send_progress_update_endpoint(payload: ProgressMessageCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Direct academic progress message to parent."""
    ustad_id = getattr(request.state, "user_id", None)
    center_id = getattr(request.state, "center_id", None)
    return communications.send_progress_message(db, ustad_id, center_id, payload.student_id, payload.message)

@router.post(
    "/progress-updates/{message_id}/reply",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["PARENT", "STUDENT", "SUPER_ADMIN"]))]
)
def reply_progress_update_endpoint(message_id: str, payload: ProgressReplyCreate, request: Request, db: Session = Depends(get_db)):
    """(Parent / Student) Reply to an academic progress message."""
    sender_id = getattr(request.state, "user_id", None)
    return communications.reply_to_progress_message(db, message_id, sender_id, payload.reply_text)

# Flow 4: Super Admin Escalations (Parent ➝ Super Admin HQ)
@router.post(
    "/escalations",
    response_model=EscalationResponseWrapper,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["PARENT", "STUDENT", "SUPER_ADMIN"]))]
)
def submit_escalation_endpoint(payload: EscalationCreate, request: Request, db: Session = Depends(get_db)):
    """(Parent / Student Only) Escalation grievance sent directly to Super Admin Headquarters (Bypasses local Nazim)."""
    submitted_by = getattr(request.state, "user_id", None)
    center_id = getattr(request.state, "center_id", None)
    return communications.create_escalation(db, submitted_by, center_id, payload)

@router.get(
    "/escalations",
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
)
def get_escalations_endpoint(request: Request, db: Session = Depends(get_db)):
    """(SUPER ADMIN ONLY) Fetch all HQ escalations. Local Nazims are strictly blocked."""
    user_role = getattr(request.state, "user_role", getattr(request.state, "role", "SUPER_ADMIN"))
    return communications.get_super_admin_escalations(db, user_role)

# Public Admissions & General Inquiry Routing
@router.post(
    "/inquiries",
    response_model=InquiryResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_public_inquiry_endpoint(payload: InquiryCreate, db: Session = Depends(get_db)):
    """Submit a public inquiry. Automatically routes to Local Nazim if center_id present, else Super Admin."""
    return communications.route_public_inquiry(db, payload)
