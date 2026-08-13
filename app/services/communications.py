from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, List, Union
from app.core.context import current_tenant_id, current_user_id
from app.models.communication import (
    InternalTicket, Broadcast, AcademicThread, AcademicMessage,
    SuperAdminEscalation, PublicInquiry, TicketStatus, BroadcastAudience
)
from app.models.auth import User
from app.schemas.communication import (
    InternalTicketCreate, BroadcastCreate, AcademicMessageCreate,
    EscalationCreate, InquiryCreate, ApprovedReportRequest
)
from app.tasks.messaging import send_app_notification, send_whatsapp_report_task

# --- Flow 1: Internal Tickets ---
def create_internal_ticket(db: Session, created_by: str, request_center_id: Optional[str], payload: InternalTicketCreate) -> dict:
    user = db.query(User).filter(User.id == created_by).first()
    target_center_id = request_center_id or (user.center_id if user else None)
    if not target_center_id:
        raise HTTPException(status_code=400, detail="Center ID required to create internal ticket")

    ticket = InternalTicket(
        center_id=target_center_id,
        created_by=created_by,
        subject=payload.subject,
        description=payload.description,
        category=payload.category or "GENERAL",
        status=TicketStatus.OPEN.value
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {
        "status": "success",
        "data": {
            "ticket_id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status,
            "created_at": ticket.created_at
        }
    }

def update_ticket_status(db: Session, ticket_id: str, new_status: str) -> InternalTicket:
    ticket = db.query(InternalTicket).filter(InternalTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket '{ticket_id}' not found")
    
    status_upper = new_status.upper()
    if status_upper not in [s.value for s in TicketStatus]:
        raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'")
    
    ticket.status = status_upper
    db.commit()
    db.refresh(ticket)
    return ticket

# --- Flow 2: Broadcasts ---
def create_broadcast(db: Session, sent_by: str, request_center_id: Optional[str], payload: BroadcastCreate) -> dict:
    user = db.query(User).filter(User.id == sent_by).first()
    target_center_id = request_center_id or (user.center_id if user else None)
    if not target_center_id:
        raise HTTPException(status_code=400, detail="Center ID required to publish broadcast")

    aud_upper = payload.audience.upper()
    if aud_upper not in [a.value for a in BroadcastAudience]:
        raise HTTPException(status_code=400, detail=f"Invalid audience '{payload.audience}'")

    broadcast = Broadcast(
        center_id=target_center_id,
        sent_by=sent_by,
        audience=aud_upper,
        target_halqa_id=payload.target_halqa_id,
        subject=payload.subject,
        message=payload.message
    )
    db.add(broadcast)
    db.commit()
    db.refresh(broadcast)

    return {
        "status": "success",
        "message": "Broadcast queued for delivery",
        "data": {
            "broadcast_id": broadcast.id,
            "audience": broadcast.audience,
            "created_at": broadcast.created_at
        }
    }

# --- Flow 3: Academic Threads & Direct Messaging ---
def get_or_create_thread(db: Session, center_id: str, ustad_id: str, student_id: str) -> AcademicThread:
    thread = db.query(AcademicThread).filter(
        AcademicThread.ustad_id == ustad_id,
        AcademicThread.student_id == student_id
    ).first()

    if not thread:
        thread = AcademicThread(
            center_id=center_id,
            ustad_id=ustad_id,
            student_id=student_id
        )
        db.add(thread)
        db.commit()
        db.refresh(thread)
    return thread

def send_approved_report_service(db: Session, student_id: Union[str, Any], report_data: ApprovedReportRequest) -> AcademicMessage:
    tenant_id = current_tenant_id.get()
    ustad_id = current_user_id.get()

    student_str = str(student_id)
    student = db.query(User).filter(User.id == student_str).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    t_id = tenant_id or student.center_id or "default"
    u_id = ustad_id or "SYSTEM"

    thread = db.query(AcademicThread).filter(
        AcademicThread.ustad_id == u_id,
        AcademicThread.student_id == student_str
    ).first()

    if not thread:
        thread = AcademicThread(
            center_id=t_id,
            ustad_id=u_id,
            student_id=student_str
        )
        db.add(thread)
        db.commit()
        db.refresh(thread)

    new_message = AcademicMessage(
        thread_id=thread.id,
        sender_id=u_id,
        message=report_data.final_text
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    try:
        send_app_notification.delay(
            student_id=student_str,
            title="New Monthly Progress Report",
            preview_text="Assalamu Alaikum, your child's monthly Dars report is ready...",
            tenant_id=t_id
        )
        send_whatsapp_report_task.delay(
            student_id=student_str,
            report_text=report_data.final_text
        )
    except Exception:
        pass

    return new_message

def send_academic_message(db: Session, thread_id: str, sender_id: str, payload: AcademicMessageCreate) -> dict:
    thread = db.query(AcademicThread).filter(AcademicThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail=f"Thread '{thread_id}' not found")

    msg = AcademicMessage(
        thread_id=thread_id,
        sender_id=sender_id,
        message=payload.message
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "status": "success",
        "data": {
            "message_id": msg.id,
            "thread_id": msg.thread_id,
            "sender_id": msg.sender_id,
            "message": msg.message,
            "created_at": msg.created_at
        }
    }

def send_progress_message(db: Session, ustad_id: str, request_center_id: Optional[str], student_id: str, message_text: str) -> AcademicMessage:
    student = db.query(User).filter(User.id == student_id).first()
    target_center_id = request_center_id or (student.center_id if student else "default")
    thread = get_or_create_thread(db, target_center_id, ustad_id, student_id)
    
    msg = AcademicMessage(
        thread_id=thread.id,
        sender_id=ustad_id,
        message=message_text
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def reply_to_progress_message(db: Session, message_id: str, sender_id: str, reply_text: str) -> dict:
    original_msg = db.query(AcademicMessage).filter(AcademicMessage.id == message_id).first()
    if not original_msg:
        raise HTTPException(status_code=404, detail=f"Message '{message_id}' not found")

    reply_msg = AcademicMessage(
        thread_id=original_msg.thread_id,
        sender_id=sender_id,
        message=reply_text
    )
    db.add(reply_msg)
    db.commit()
    db.refresh(reply_msg)
    return {
        "id": reply_msg.id,
        "thread_id": reply_msg.thread_id,
        "sender_id": reply_msg.sender_id,
        "reply_text": reply_msg.message,
        "created_at": reply_msg.created_at
    }

# --- Flow 4: Super Admin Escalations ---
def submit_escalation_service(db: Session, escalation_data: EscalationCreate) -> SuperAdminEscalation:
    tenant_id = current_tenant_id.get()
    user_id = current_user_id.get()

    if not user_id:
        user_id = "ANONYMOUS"

    u_obj = db.query(User).filter(User.id == user_id).first() if user_id != "ANONYMOUS" else None
    t_id = tenant_id or (u_obj.center_id if u_obj else None) or "default"

    new_escalation = SuperAdminEscalation(
        center_id=t_id,
        submitted_by=user_id if user_id != "ANONYMOUS" else (u_obj.id if u_obj else t_id),
        subject=escalation_data.subject,
        complaint_details=escalation_data.complaint_details,
        status=TicketStatus.OPEN.value
    )

    db.add(new_escalation)
    db.commit()
    db.refresh(new_escalation)

    try:
        send_app_notification.delay(
            student_id=str(new_escalation.id),
            title=f"URGENT: Escalation from Center ID {t_id}",
            preview_text=escalation_data.subject,
            tenant_id=t_id
        )
    except Exception:
        pass

    return new_escalation

def create_escalation(db: Session, submitted_by: str, request_center_id: Optional[str], payload: EscalationCreate) -> dict:
    user = db.query(User).filter(User.id == submitted_by).first() if submitted_by else None
    target_center_id = request_center_id or (user.center_id if user else None)
    if not target_center_id and not user:
        target_center_id = "default"

    escalation = SuperAdminEscalation(
        center_id=target_center_id or "default",
        submitted_by=submitted_by or (user.id if user else "default"),
        subject=payload.subject,
        complaint_details=payload.complaint_details,
        status=TicketStatus.OPEN.value
    )
    db.add(escalation)
    db.commit()
    db.refresh(escalation)

    return {
        "status": "success",
        "message": "Your grievance has been securely forwarded directly to Super Admin Headquarters. A representative will contact you.",
        "data": {
            "escalation_id": escalation.id,
            "status": escalation.status,
            "created_at": escalation.created_at
        }
    }

def get_super_admin_escalations(db: Session, user_role: str) -> List[SuperAdminEscalation]:
    if user_role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Escalations to Super Admin Headquarters are isolated and restricted from local admins (not authorized)."
        )
    return db.query(SuperAdminEscalation).order_by(SuperAdminEscalation.created_at.desc()).all()

# --- Public Inquiry Routing ---
def route_public_inquiry(db: Session, payload: InquiryCreate) -> PublicInquiry:
    routed_to = "LOCAL_NAZIM" if payload.center_id else "SUPER_ADMIN"
    inquiry = PublicInquiry(
        center_id=payload.center_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
        routed_to=routed_to
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry
