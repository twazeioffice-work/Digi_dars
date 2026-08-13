from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.communication import (
    InternalTicketCreate, InternalTicketStatusUpdate, InternalTicketResponse,
    BroadcastNoticeCreate, BroadcastNoticeResponse,
    ProgressUpdateCreate, ProgressMessageResponse, ProgressReplyCreate, ProgressReplyResponse,
    EscalationCreate, EscalationResponse,
    InquiryCreate, InquiryResponse
)
from app.services import communications
from app.core.guards import role_guard

router = APIRouter(prefix="/v1/communications", tags=["Module 4: 4-Way Communication & Ticketing"])

@router.post(
    "/tickets",
    response_model=InternalTicketResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def create_internal_ticket_endpoint(payload: InternalTicketCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad / Staff Only) Open an internal ticket for the Nazim."""
    center_id = request.state.center_id
    ustad_id = request.state.user_id
    return communications.create_internal_ticket(db, center_id, ustad_id, payload)

@router.patch(
    "/tickets/{ticket_id}/status",
    response_model=InternalTicketResponse,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def update_ticket_status_endpoint(
    ticket_id: str,
    payload: InternalTicketStatusUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """(Nazim / Admin Only) Resolve or update an internal staff ticket status."""
    center_id = request.state.center_id
    return communications.update_ticket_status(db, center_id, ticket_id, payload.status)

@router.post(
    "/broadcasts",
    response_model=BroadcastNoticeResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def send_broadcast_message_endpoint(payload: BroadcastNoticeCreate, request: Request, db: Session = Depends(get_db)):
    """(Admin / Nazim Only) Send a broadcast message to parents or batches."""
    center_id = request.state.center_id
    user_id = request.state.user_id
    return communications.send_broadcast_message(db, center_id, user_id, payload)

@router.post(
    "/progress-updates",
    response_model=ProgressMessageResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def send_progress_update_endpoint(payload: ProgressUpdateCreate, request: Request, db: Session = Depends(get_db)):
    """(Ustad Only) Send a direct progress update message regarding a student to their parent."""
    ustad_id = request.state.user_id
    return communications.send_progress_update(db, ustad_id, payload)

@router.post(
    "/progress-updates/{message_id}/reply",
    response_model=ProgressReplyResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD", "PARENT"]))]
)
def reply_to_ustad_endpoint(
    message_id: str,
    payload: ProgressReplyCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Reply to an academic progress thread."""
    sender_id = request.state.user_id
    return communications.reply_to_ustad(db, message_id, sender_id, payload)

@router.post(
    "/escalations",
    response_model=EscalationResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD", "PARENT", "STUDENT"]))]
)
def create_super_admin_escalation_endpoint(payload: EscalationCreate, request: Request, db: Session = Depends(get_db)):
    """Escalate a grievance directly to the Super Admin (bypasses local center scoping)."""
    user_id = request.state.user_id
    center_id = request.state.center_id
    return communications.create_super_admin_escalation(db, user_id, center_id, payload)

@router.post(
    "/inquiries",
    response_model=InquiryResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_inquiry_endpoint(payload: InquiryCreate, db: Session = Depends(get_db)):
    """Public endpoint to submit admission / general inquiries. Auto-routes to local Nazim if center_id provided, else Super Admin."""
    return communications.submit_inquiry(db, payload)
