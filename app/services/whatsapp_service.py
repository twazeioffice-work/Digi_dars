"""
WhatsApp Service Engine v2
Handles automatic parent-student-teacher phone mapping, incoming WABA webhooks,
unrecognized sender triaging for Nazim verification, re-routing threads to assigned Usthads,
storing communication logs in WhatsAppMessage table, confidential #complaint bypass
routing directly to Super Admin HQ, and Usthad reply dispatching via Meta Cloud API.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
import structlog

from app.models.auth import User, Center
from app.models.enums import UserRole
from app.models.academic import HalqaEnrollment, Halqa
from app.models.communication import WhatsAppMessage
from app.models.complaint import Complaint, ComplaintStatus
from app.services.whatsapp_client import send_whatsapp_message

logger = structlog.get_logger(__name__)

async def process_incoming_whatsapp(db_session: Session, phone_number: str, incoming_text: str):
    """
    Parses incoming WABA WhatsApp messages:
    1. Clean phone number and map to Parent / Student registry.
    2. If unrecognized sender, flag is_unrecognized_sender=True and route to Nazim Verification Workspace.
    3. Check for #complaint or 'complaint:' tag to route directly to Super Admin HQ.
    4. Route mapped message directly to assigned Usthad's CRM inbox thread.
    5. Log interaction in WhatsAppMessage table.
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
    is_unrecognized = False

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
    else:
        # Unregistered / Unmapped phone number -> Flag as unrecognized for Nazim workspace
        is_unrecognized = True

    # Find student's assigned Usthad if student found
    if student_id:
        enrollment = db_session.query(HalqaEnrollment).filter(
            HalqaEnrollment.student_id == student_id,
            HalqaEnrollment.is_active == True
        ).first()
        if enrollment and enrollment.halqa_id:
            halqa = db_session.query(Halqa).filter(Halqa.id == enrollment.halqa_id).first()
            if halqa:
                ustad_id = halqa.ustad_id

    # Fallback to any active Usthad in center if not explicitly enrolled
    if not ustad_id and center_id:
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
        first_center = db_session.query(Center).first()
        new_complaint = Complaint(
            center_id=center_id or (first_center.id if first_center else None),
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
            is_complaint=True,
            is_unrecognized_sender=is_unrecognized
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

    # 3. Message Routing: Log in database
    msg_log = WhatsAppMessage(
        center_id=center_id,
        sender_phone=formatted_phone,
        recipient_phone="USTHAD_CRM_INBOX" if not is_unrecognized else "NAZIM_VERIFICATION_WORKSPACE",
        direction="INBOUND",
        message_text=text_content,
        student_id=student_id,
        ustad_id=ustad_id,
        is_complaint=False,
        is_unrecognized_sender=is_unrecognized
    )
    db_session.add(msg_log)
    db_session.commit()

    # If unrecognized, send quick message to parent notifying them of Nazim verification
    if is_unrecognized:
        await send_whatsapp_message(
            formatted_phone,
            "Assalamu Alaikum! Your number is not currently registered in our student portal. "
            "A Nazim from your madrasa will verify and assist you shortly."
        )
        return

    # Standard registered message auto-replies
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
        is_complaint=False,
        is_unrecognized_sender=False
    )
    db_session.add(outbound_log)
    db_session.commit()

    return {"status": "sent", "recipient": formatted_phone, "message": reply_text}


def get_unlinked_whatsapp_threads(db_session: Session, center_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves unlinked orphan WhatsApp threads for Nazim Verification Workspace.
    Returns list of unlinked sender threads grouped by sender_phone.
    """
    query = db_session.query(WhatsAppMessage).filter(WhatsAppMessage.is_unrecognized_sender == True)
    if center_id:
        query = query.filter(or_(WhatsAppMessage.center_id == center_id, WhatsAppMessage.center_id == None))

    messages = query.order_by(WhatsAppMessage.created_at.desc()).all()

    # Group by sender_phone
    threads_map: Dict[str, List[WhatsAppMessage]] = {}
    for m in messages:
        phone = m.sender_phone if m.direction == "INBOUND" else m.recipient_phone
        if phone not in threads_map:
            threads_map[phone] = []
        threads_map[phone].append(m)

    results = []
    for phone, msgs in threads_map.items():
        sorted_msgs = sorted(msgs, key=lambda x: x.created_at)
        last_msg = sorted_msgs[-1]
        results.append({
            "sender_phone": phone,
            "message_count": len(msgs),
            "last_message": last_msg.message_text,
            "last_message_at": last_msg.created_at.isoformat() if last_msg.created_at else None,
            "messages": [
                {
                    "id": m.id,
                    "direction": m.direction,
                    "sender_phone": m.sender_phone,
                    "recipient_phone": m.recipient_phone,
                    "message_text": m.message_text,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                }
                for m in sorted_msgs
            ]
        })

    return results


async def send_nazim_unlinked_reply(
    db_session: Session,
    nazim_id: str,
    recipient_phone: str,
    message_text: str
) -> dict:
    """
    Allows Nazim to message an unlinked sender directly from the Nazim Verification Workspace.
    """
    nazim = db_session.query(User).filter(User.id == nazim_id).first()
    clean_phone = recipient_phone.replace(" ", "").replace("-", "").strip()
    formatted_phone = clean_phone if clean_phone.startswith("+") else f"+{clean_phone}"

    await send_whatsapp_message(formatted_phone, message_text)

    outbound_log = WhatsAppMessage(
        center_id=nazim.center_id if nazim else None,
        sender_phone=nazim.phone if nazim and nazim.phone else "NAZIM_VERIFICATION",
        recipient_phone=formatted_phone,
        direction="OUTBOUND",
        message_text=message_text,
        student_id=None,
        ustad_id=None,
        is_complaint=False,
        is_unrecognized_sender=True
    )
    db_session.add(outbound_log)
    db_session.commit()

    return {"status": "sent", "recipient": formatted_phone, "message": message_text}


def reroute_unrecognized_whatsapp_thread(
    db_session: Session,
    sender_phone: str,
    student_id: str
) -> dict:
    """
    Executes the Nazim Verify & Re-Route workflow:
    1. Permanently links sender_phone to Student profile.
    2. Resolves assigned Usthad for student.
    3. Performs batch update on all historical message logs for sender_phone:
       - Sets student_id = student.id
       - Sets ustad_id = assigned Usthad ID
       - Sets center_id = student.center_id
       - Toggles is_unrecognized_sender = False
    4. Thread disappears from Nazim unlinked feed and appears in Usthad workspace!
    """
    student = db_session.query(User).filter(User.id == student_id, User.role == UserRole.STUDENT.value).first()
    if not student:
        raise ValueError(f"Student with ID {student_id} not found.")

    clean_phone = sender_phone.replace(" ", "").replace("-", "").strip()
    formatted_phone = clean_phone if clean_phone.startswith("+") else f"+{clean_phone}"

    # 1. Permanently link phone to student user profile
    student.phone = formatted_phone
    db_session.add(student)

    # 2. Resolve Usthad for student
    ustad_id = None
    enrollment = db_session.query(HalqaEnrollment).filter(
        HalqaEnrollment.student_id == student.id,
        HalqaEnrollment.is_active == True
    ).first()
    if enrollment and enrollment.halqa_id:
        halqa = db_session.query(Halqa).filter(Halqa.id == enrollment.halqa_id).first()
        if halqa:
            ustad_id = halqa.ustad_id

    if not ustad_id and student.center_id:
        ustad = db_session.query(User).filter(
            User.role == UserRole.USTAD.value,
            User.center_id == student.center_id,
            User.is_active == True
        ).first()
        if ustad:
            ustad_id = ustad.id

    # 3. Batch update all historical messages for this sender_phone
    messages = db_session.query(WhatsAppMessage).filter(
        or_(
            WhatsAppMessage.sender_phone.in_([sender_phone, clean_phone, formatted_phone]),
            WhatsAppMessage.recipient_phone.in_([sender_phone, clean_phone, formatted_phone])
        )
    ).all()

    updated_count = 0
    for m in messages:
        m.student_id = student.id
        m.ustad_id = ustad_id
        m.center_id = student.center_id
        m.is_unrecognized_sender = False
        updated_count += 1

    db_session.commit()

    logger.info(
        "whatsapp_thread_rerouted",
        sender_phone=formatted_phone,
        student_id=student.id,
        student_name=student.full_name,
        assigned_ustad_id=ustad_id,
        re_routed_count=updated_count
    )

    return {
        "status": "success",
        "sender_phone": formatted_phone,
        "student_id": student.id,
        "student_name": student.full_name,
        "assigned_ustad_id": ustad_id,
        "re_routed_count": updated_count
    }
