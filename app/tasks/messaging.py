import logging
from app.core.celery_app import celery_app

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
