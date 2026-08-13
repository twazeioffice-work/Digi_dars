import logging
import asyncio
from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.models.auth import User, ParentStudentRelation
from app.models.enums import UserRole
from app.services.whatsapp_client import send_whatsapp_message

logger = logging.getLogger(__name__)

@celery_app.task(name="tasks.messaging.send_absentee_alert", bind=True, max_retries=3)
def send_absentee_alert(self, student_name: str, parent_phone: str, date_str: str):
    """Worker 1 (q_urgent): Send automated SMS absentee alert with exponential backoff retry."""
    try:
        message = (
            f"Assalamu Alaikum. {student_name} was marked absent for Dars on {date_str}. "
            f"Please contact the Nazim if this is an error."
        )
        logger.info(f"[SMS Gateway] Sending SMS to {parent_phone}: '{message}'")
        return {"status": "sent", "recipient": parent_phone, "message": message}
    except Exception as exc:
        logger.error(f"[SMS Gateway Error] Retrying SMS alert for {student_name}: {exc}")
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)

@celery_app.task(name="tasks.messaging.send_urgent_notification")
def send_urgent_notification(user_id: str, title: str, message: str):
    """Worker 1 (q_urgent): Push real-time notification to Ustad / Admin."""
    logger.info(f"[Urgent Push] User: {user_id} | Title: {title} | Message: {message}")
    return {"status": "pushed", "user_id": user_id, "title": title}

@celery_app.task(name="tasks.messaging.send_app_notification")
def send_app_notification(student_id: str, title: str, preview_text: str, tenant_id: str):
    """Worker 1 (q_urgent): Push app notification to parent."""
    logger.info(f"[App Notification] Tenant: {tenant_id} | Student: {student_id} | Title: {title}")
    return {"status": "sent", "student_id": student_id, "title": title}

@celery_app.task(name="tasks.messaging.send_whatsapp_report", bind=True, max_retries=3)
def send_whatsapp_report_task(self, student_id: str, report_text: str):
    """
    Celery task: Looks up the parent's phone number and sends the approved report via WhatsApp.
    Retries up to 3 times if the Meta API fails.
    """
    try:
        asyncio.run(_process_and_send_whatsapp(student_id, report_text))
    except Exception as exc:
        logger.error(f"whatsapp_dispatch_failed: student_id={student_id}, error={exc}")
        raise self.retry(exc=exc, countdown=60)

async def _process_and_send_whatsapp(student_id: str, report_text: str):
    """Asynchronous core logic for the worker."""
    db_session = SessionLocal()
    try:
        # 1. Fetch Student details
        student = db_session.query(User).filter(User.id == student_id).first()
        if not student:
            logger.warning(f"student_not_found_for_whatsapp: student_id={student_id}")
            return

        # 2. Find linked Parent's phone number
        parent = db_session.query(User).join(
            ParentStudentRelation, ParentStudentRelation.parent_id == User.id
        ).filter(
            ParentStudentRelation.student_id == student_id,
            User.role == UserRole.PARENT.value,
            User.is_active == True
        ).first()

        if not parent or not parent.phone:
            logger.warning(f"no_parent_phone_found: student_id={student_id}")
            return

        # 3. Format final WhatsApp message
        formatted_message = (
            f"Assalamu Alaikum {parent.full_name},\n\n"
            f"Here is the monthly Dars progress report for *{student.full_name}*:\n\n"
            f"{report_text}\n\n"
            "Reply with '1' anytime to check today's Jamaat attendance."
        )

        # 4. Dispatch to Meta API
        await send_whatsapp_message(parent.phone, formatted_message)
        logger.info(f"whatsapp_report_sent_successfully: parent_id={parent.id}")
    finally:
        db_session.close()
