import logging
from datetime import datetime, timedelta, timezone
from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.services.rag_ai import sync_student_remarks

logger = logging.getLogger(__name__)

@celery_app.task(name="tasks.vector.sync_ustad_remarks_to_vector_db")
def sync_ustad_remarks_to_vector_db():
    """
    Worker 2 (q_vector_sync): Periodic scheduled task (Celery Beat).
    Fetches weekly remarks from PostgreSQL for all students, aggregates, and upserts to Vector DB.
    """
    db = SessionLocal()
    try:
        logger.info("[Celery Beat] Initiating weekly Ustad remarks vectorization job...")
        # Query distinct student IDs who have remarks
        from app.models.academic import TarbiyyahLog, HifzLog
        
        tarbiyyah_students = db.query(TarbiyyahLog.student_id).distinct().all()
        hifz_students = db.query(HifzLog.student_id).distinct().all()
        
        student_ids = list(set([s[0] for s in tarbiyyah_students] + [s[0] for s in hifz_students]))
        synced_total = 0

        for sid in student_ids:
            res = sync_student_remarks(db, student_id=sid, month="August", year="2026")
            synced_total += res.get("chunks_synced", 0)

        logger.info(f"[Celery Beat] Sync complete. Processed {len(student_ids)} students ({synced_total} chunks).")
        return {"status": "success", "students_processed": len(student_ids), "chunks_synced": synced_total}
    finally:
        db.close()
