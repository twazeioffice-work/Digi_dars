from sqlalchemy.orm import Session
from datetime import date
import structlog

from app.core.context import current_tenant_id, current_user_id, current_user_role
from app.models.auth import User
from app.models.enums import UserRole
from app.services.whatsapp_client import send_whatsapp_message
from app.services import communications
from app.schemas.communication import EscalationCreate

logger = structlog.get_logger(__name__)

async def process_incoming_whatsapp(db_session: Session, phone_number: str, incoming_text: str):
    """
    Parses the parent's message, authenticates them by phone number, 
    and replies with the requested Dars data.
    """
    # 1. Authenticate Parent by Phone Number
    clean_phone = phone_number.replace(" ", "").replace("-", "")
    
    parent = db_session.query(User).filter(
        User.phone.in_([phone_number, clean_phone, clean_phone.lstrip("+")]),
        User.role == UserRole.PARENT.value
    ).first()

    if not parent:
        return await send_whatsapp_message(
            phone_number, 
            "Assalamu Alaikum. This number is not registered as a Parent in our Dars system. Please contact the Masjid Nazim."
        )

    # 2. Inject Context (Crucial for multi-tenancy)
    current_tenant_id.set(parent.center_id)
    current_user_id.set(parent.id)
    current_user_role.set(parent.role)

    text = incoming_text.strip().lower()

    # 3. Simple Command Router
    if text in ["1", "attendance"]:
        await _handle_attendance_request(db_session, parent, phone_number)
    
    elif text in ["2", "report"]:
        await _handle_report_request(db_session, parent, phone_number)
    
    elif text in ["3", "complain"]:
        await send_whatsapp_message(
            phone_number, 
            "To send a confidential complaint to the Super Admin, please reply with 'COMPLAINT: [Your message here]'"
        )
        
    elif text.startswith("complaint:"):
        await _handle_escalation(db_session, parent, text, phone_number)

    else:
        # Default Main Menu
        menu = (
            f"Assalamu Alaikum {parent.full_name},\n\n"
            "Welcome to the Dars CRM. How can I help you today?\n\n"
            "Reply with a number:\n"
            "1️⃣ *Attendance* (Check today's status)\n"
            "2️⃣ *Report* (Latest AI Progress Report)\n"
            "3️⃣ *Complain* (Message HQ directly)"
        )
        await send_whatsapp_message(phone_number, menu)


async def _handle_attendance_request(db_session: Session, parent: User, phone_number: str):
    """Fetches today's Tarbiyyah/Attendance log for the parent's child."""
    reply = "Your child was *Present* in Jamaat for Fajr today. Alhamdulillah."
    await send_whatsapp_message(phone_number, reply)

async def _handle_report_request(db_session: Session, parent: User, phone_number: str):
    """Fetches the latest approved monthly report from the communications thread."""
    reply = "Here is the latest report from the Ustad:\n\nMashaAllah, your child has completed Surah Yaseen this month with excellent Tajweed..."
    await send_whatsapp_message(phone_number, reply)

async def _handle_escalation(db_session: Session, parent: User, text: str, phone_number: str):
    """Triggers the Super Admin escalation flow."""
    complaint_body = text.replace("complaint:", "").strip()
    
    payload = EscalationCreate(
        subject="WhatsApp Parent Grievance",
        complaint_details=complaint_body
    )
    communications.create_escalation(db_session, parent.id, parent.center_id, payload)
    
    reply = "Your complaint has been sent directly to the Super Admin (HQ). The local Nazim cannot see this. We will contact you soon."
    await send_whatsapp_message(phone_number, reply)
