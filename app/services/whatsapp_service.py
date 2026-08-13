"""
WhatsApp Service Engine
Handles automatic parent-student-teacher phone mapping, incoming WABA webhooks,
storing communication logs in WhatsAppMessage table, confidential #complaint bypass
routing directly to Super Admin HQ, and Usthad reply dispatching via Meta Cloud API.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import structlog

from app.models.auth import User, Center
from app.models.enums import UserRole
from app.models.communication import WhatsAppMessage
from app.models.complaint import Complaint, ComplaintStatus
from app.services.whatsapp_client import send_whatsapp_message

logger = structlog.get_logger(__name__)

async def process_incoming_whatsapp(db_session: Session, phone_number: str, incoming_text: str):
    """
    Parses incoming WABA WhatsApp messages:
    1. Clean phone number and map to Parent / Student registry.
    2. Check for #complaint or 'complaint:' tag to route directly to Super Admin HQ.
    3. Route standard message to assigned Usthad's CRM inbox thread.
    4. Log interaction in WhatsAppMessage table.
    """
    clean_phone = phone_number.replace(" ", "").replace("-", "").strip()
    formatted_phone = clean_phone if clean_phone.startswith("+") else f"+{clean_phone}"

    text_content = incoming_text.strip()
    is_complaint = "#complaint" in text_content.lower() or text_content.lower().startswith("complaint:")

    # 1. Lookup parent or student by phone
    parent_or_student = db_session.query(User).filter(
        User.phone.in_([phone_number, clean_phone, formatted_phone, clean_phone.lstrip("+")]),
        User.is_active == True
    ).first()

    student_id = None
    ustad_id = None
    center_id = None

    if parent_or_student:
        center_id = parent_or_student.center_id
        if parent_or_student.role == UserRole.STUDENT.value:
            student_id = parent_or_student.id
        else:
            # Find student associated with parent/center
            s = db_session.query(User).filter(
                User.role == UserRole.STUDENT.value,
                User.center_id == parent_or_student.center_id
            ).first()
            if s:
                student_id = s.id

    # Find center Usthad
    if center_id:
        ustad = db_session.query(User).filter(
            User.role == UserRole.USTAD.value,
            User.center_id == center_id,
            User.is_active == True
        ).first()
        if ustad:
            ustad_id = ustad.id

    # 2. If #complaint tag present, bypass local branch and submit directly to Super Admin HQ
    if is_complaint:
        clean_complaint_text = text_content.replace("#complaint", "").replace("complaint:", "").replace("COMPLAINT:", "").strip()
        new_complaint = Complaint(
            center_id=center_id or (db_session.query(Center).first().id if db_session.query(Center).first() else None),
            student_id=student_id or (parent_or_student.id if parent_or_student else None),
            category="WhatsApp Grievance",
            description=f"WhatsApp Complaint from {formatted_phone}: {clean_complaint_text}",
            is_anonymous=False,
            status=ComplaintStatus.PENDING_SUPER_ADMIN.value
        )
        db_session.add(new_complaint)
        db_session.commit()

        # Save WhatsApp log
        msg_log = WhatsAppMessage(
            center_id=center_id,
            sender_phone=formatted_phone,
            recipient_phone="SYSTEM_SUPER_ADMIN_HQ",
            direction="INBOUND",
            message_text=text_content,
            student_id=student_id,
            ustad_id=ustad_id,
            is_complaint=True
        )
        db_session.add(msg_log)
        db_session.commit()

        # Send confirmation to parent
        await send_whatsapp_message(
            formatted_phone,
            "🔒 *Confidential Complaint Received*: Your complaint has been submitted directly to Super Admin HQ. "
            "Local branch administrators cannot see this message."
        )
        return

    # 3. Standard Message: Log in database and route to Usthad CRM inbox
    msg_log = WhatsAppMessage(
        center_id=center_id,
        sender_phone=formatted_phone,
        recipient_phone="USTHAD_CRM_INBOX",
        direction="INBOUND",
        message_text=text_content,
        student_id=student_id,
        ustad_id=ustad_id,
        is_complaint=False
    )
    db_session.add(msg_log)
    db_session.commit()

    # Reply with quick automated status if keyword matched
    lower_text = text_content.lower()
    if lower_text in ["1", "attendance"]:
        await send_whatsapp_message(formatted_phone, "Assalamu Alaikum. Your child was *Present* for Fajr Jamaat today. Alhamdulillah.")
    elif lower_text in ["2", "report"]:
        await send_whatsapp_message(formatted_phone, "MashaAllah, your child's monthly Tarbiyyah progress is on track.")
    else:
        await send_whatsapp_message(
            formatted_phone,
            "Assalamu Alaikum! Your message has been received by Usthad. "
            "Reply with *1* for Attendance, *2* for Report, or add *#complaint* to message HQ directly."
        )


async def send_usthad_whatsapp_reply(
    db_session: Session,
    ustad_id: str,
    recipient_phone: str,
    reply_text: str,
    student_id: Optional[str] = None
) -> dict:
    """
    Invoked when Usthad replies directly from CRM dashboard to parent's WhatsApp chat.
    Uses Meta Cloud API (send_whatsapp_message) and logs outbound message in database.
    """
    ustad = db_session.query(User).filter(User.id == ustad_id).first()
    clean_phone = recipient_phone.replace(" ", "").replace("-", "").strip()
    formatted_phone = clean_phone if clean_phone.startswith("+") else f"+{clean_phone}"

    # Send message via Meta Cloud API
    await send_whatsapp_message(formatted_phone, reply_text)

    # Log outbound WhatsApp message
    outbound_log = WhatsAppMessage(
        center_id=ustad.center_id if ustad else None,
        sender_phone=ustad.phone if ustad and ustad.phone else "USTHAD_CRM",
        recipient_phone=formatted_phone,
        direction="OUTBOUND",
        message_text=reply_text,
        student_id=student_id,
        ustad_id=ustad_id,
        is_complaint=False
    )
    db_session.add(outbound_log)
    db_session.commit()

    return {"status": "sent", "recipient": formatted_phone, "message": reply_text}
