from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, List
from app.models.communication import (
    InternalTicket, BroadcastNotice, ProgressMessage, ProgressMessageReply,
    SuperAdminEscalation, PublicInquiry, TicketStatus
)
from app.models.auth import User, ParentStudentLink
from app.schemas.communication import (
    InternalTicketCreate, BroadcastNoticeCreate, ProgressUpdateCreate,
    ProgressReplyCreate, EscalationCreate, InquiryCreate
)

def create_internal_ticket(db: Session, request_center_id: Optional[str], ustad_id: str, payload: InternalTicketCreate) -> InternalTicket:
    target_center_id = payload.center_id or request_center_id
    if not target_center_id:
        ustad = db.query(User).filter(User.id == ustad_id).first()
        if ustad:
            target_center_id = ustad.center_id

    if not target_center_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid center_id must be provided or linked to user"
        )

    ticket = InternalTicket(
        center_id=target_center_id,
        ustad_id=ustad_id,
        subject=payload.subject,
        description=payload.description,
        status=TicketStatus.OPEN.value
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

def update_ticket_status(db: Session, request_center_id: Optional[str], ticket_id: str, status_val: str) -> InternalTicket:
    ticket = db.query(InternalTicket).filter(InternalTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found"
        )
    status_upper = status_val.upper()
    if status_upper not in [s.value for s in TicketStatus]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_val}'"
        )
    ticket.status = status_upper
    db.commit()
    db.refresh(ticket)
    return ticket

def send_broadcast_message(db: Session, request_center_id: Optional[str], created_by: str, payload: BroadcastNoticeCreate) -> BroadcastNotice:
    target_center_id = payload.center_id or request_center_id
    if not target_center_id:
        sender = db.query(User).filter(User.id == created_by).first()
        if sender:
            target_center_id = sender.center_id

    if not target_center_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid center_id must be provided or linked to user"
        )

    notice = BroadcastNotice(
        center_id=target_center_id,
        audience=payload.audience,
        message=payload.message,
        created_by=created_by
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

def send_progress_update(db: Session, ustad_id: str, payload: ProgressUpdateCreate) -> ProgressMessage:
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{payload.student_id}' not found"
        )

    link = db.query(ParentStudentLink).filter(ParentStudentLink.student_id == payload.student_id).first()
    parent_id = link.parent_id if link else None

    progress_msg = ProgressMessage(
        student_id=payload.student_id,
        ustad_id=ustad_id,
        parent_id=parent_id,
        message=payload.message
    )
    db.add(progress_msg)
    db.commit()
    db.refresh(progress_msg)
    return progress_msg

def reply_to_ustad(db: Session, message_id: str, sender_id: str, payload: ProgressReplyCreate) -> ProgressMessageReply:
    parent_msg = db.query(ProgressMessage).filter(ProgressMessage.id == message_id).first()
    if not parent_msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Progress message thread '{message_id}' not found"
        )

    reply = ProgressMessageReply(
        message_id=message_id,
        sender_id=sender_id,
        reply_text=payload.reply_text
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply

def create_super_admin_escalation(db: Session, user_id: str, center_id: Optional[str], payload: EscalationCreate) -> SuperAdminEscalation:
    escalation = SuperAdminEscalation(
        user_id=user_id,
        center_id=center_id,
        subject=payload.subject,
        grievance_description=payload.grievance_description,
        priority=payload.priority or "URGENT",
        status=TicketStatus.OPEN.value
    )
    db.add(escalation)
    db.commit()
    db.refresh(escalation)
    return escalation

def submit_inquiry(db: Session, payload: InquiryCreate) -> PublicInquiry:
    routed_target = "LOCAL_NAZIM" if payload.center_id else "SUPER_ADMIN"

    inquiry = PublicInquiry(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
        center_id=payload.center_id,
        routed_to=routed_target,
        status=TicketStatus.OPEN.value
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry
