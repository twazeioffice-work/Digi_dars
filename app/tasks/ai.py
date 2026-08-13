import logging
from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.services.rag_ai import generate_natural_language_report
from app.tasks.messaging import send_urgent_notification

logger = logging.getLogger(__name__)

@celery_app.task(name="tasks.ai.generate_student_report", rate_limit="10/m")
def generate_student_report(student_id: str, month: str = "August", year: str = "2026", ustad_id: str = None):
    """
    Worker 3 (q_llm_batch): Heavy LLM API execution for individual student report with rate limiting.
    Fetches structured stats + vector remarks, synthesizes draft, and notifies Ustad upon completion.
    """
    db = SessionLocal()
    try:
        logger.info(f"[q_llm_batch] Generating Hybrid RAG report for student '{student_id}'...")
        report_res = generate_natural_language_report(db, student_id=student_id, month=month, year=year)

        if ustad_id:
            send_urgent_notification.delay(
                user_id=ustad_id,
                title="AI Progress Report Drafted",
                message=f"AI Report draft for student {report_res['student_name']} is ready for review."
            )

        return report_res
    finally:
        db.close()

@celery_app.task(name="tasks.ai.generate_batch_reports")
def generate_batch_reports(halqa_id: str, month: str = "August", year: str = "2026", ustad_id: str = None):
    """
    Master Task: Triggered by API. Queries all students in halqa_id, spawns sub-tasks into q_llm_batch.
    """
    db = SessionLocal()
    try:
        from app.models.academic import HalqaEnrollment
        enrollments = db.query(HalqaEnrollment).filter(
            HalqaEnrollment.halqa_id == halqa_id,
            HalqaEnrollment.status == "ACTIVE"
        ).all()

        student_ids = [e.student_id for e in enrollments]
        logger.info(f"[Master Task] Batch generating {len(student_ids)} reports for Halqa '{halqa_id}'...")

        task_ids = []
        for sid in student_ids:
            sub_task = generate_student_report.delay(student_id=sid, month=month, year=year, ustad_id=ustad_id)
            task_ids.append(sub_task.id)

        return {
            "status": "queued",
            "halqa_id": halqa_id,
            "total_students": len(student_ids),
            "sub_task_ids": task_ids
        }
    finally:
        db.close()
