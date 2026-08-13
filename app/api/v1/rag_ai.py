from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.rag import (
    DocumentIngestCreate, DocumentIngestResponse,
    SyncRemarksCreate, ProgressReportRequest, AIReportResponse,
    BatchReportRequest, BatchReportResponse,
    PolicyBotQuery, PolicyBotResponse,
    TextToSQLRequest, TextToSQLResponse,
    TextToSqlRequest, TextToSqlResponse,
    AbsenteeAlertCreate
)
from app.services import rag_ai
from app.core.guards import role_guard
from app.tasks.ai import generate_batch_reports
from app.tasks.messaging import send_absentee_alert
from app.models.auth import User

router = APIRouter(prefix="/v1/ai", tags=["Module 5: RAG & AI Processing ( Celery & Redis Task Architecture)"])

@router.post(
    "/documents/ingest",
    response_model=DocumentIngestResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def ingest_document_endpoint(payload: DocumentIngestCreate, request: Request, db: Session = Depends(get_db)):
    """Ingest a policy PDF or rulebook into vector storage."""
    center_id = getattr(request.state, "center_id", None)
    return rag_ai.ingest_document(db, center_id, payload)

@router.post(
    "/students/{student_id}/sync-remarks",
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def sync_student_remarks_endpoint(student_id: str, payload: SyncRemarksCreate, db: Session = Depends(get_db)):
    """Synchronize daily Ustad remarks into vector storage."""
    return rag_ai.sync_student_remarks(db, student_id, payload.month or "August", payload.year or "2026")

@router.get(
    "/reports/generate/{student_id}",
    response_model=AIReportResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def generate_student_report_endpoint(
    student_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    RAG Endpoint: Generates a monthly progress report for a student 
    using PostgreSQL for stats and Pinecone for qualitative remarks.
    """
    tenant_id = getattr(request.state, "center_id", None)
    return rag_ai.draft_monthly_report_service(db, student_id=student_id, tenant_id=tenant_id)

@router.post(
    "/reports/generate",
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def generate_single_report_endpoint(payload: ProgressReportRequest, db: Session = Depends(get_db)):
    """Generate a single student Hybrid RAG progress report synchronously."""
    return rag_ai.generate_natural_language_report(db, payload.student_id, payload.month or "August", payload.year or "2026")

@router.post(
    "/reports/batch-generate",
    response_model=BatchReportResponse,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def batch_generate_reports_endpoint(payload: BatchReportRequest, request: Request, db: Session = Depends(get_db)):
    """
    (202 Accepted) Master Task: Triggers asynchronous batch AI report generation for an entire Halqa.
    Celery master task queries all students, queues individual sub-tasks into q_llm_batch (rate-limited 10/m),
    and sends completion push notifications to Ustad via q_urgent.
    """
    ustad_id = getattr(request.state, "user_id", None)
    from app.models.academic import HalqaEnrollment
    enrollments = db.query(HalqaEnrollment).filter(
        HalqaEnrollment.halqa_id == payload.halqa_id,
        HalqaEnrollment.status == "ACTIVE"
    ).all()
    count = len(enrollments)

    async_res = generate_batch_reports.delay(
        halqa_id=payload.halqa_id,
        month=payload.month or "August",
        year=payload.year or "2026",
        ustad_id=ustad_id
    )

    return {
        "status": "queued",
        "halqa_id": payload.halqa_id,
        "total_students": count if count > 0 else 1,
        "master_task_id": async_res.id,
        "message": "Batch AI report generation queued. Celery master task will process reports asynchronously."
    }

@router.post(
    "/alerts/absentee",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def trigger_absentee_alert_endpoint(payload: AbsenteeAlertCreate, db: Session = Depends(get_db)):
    """(202 Accepted) Trigger automated SMS absentee alert via q_urgent queue with exponential backoff retries."""
    student = db.query(User).filter(User.id == payload.student_id).first()
    student_name = student.full_name if student else "Student"

    task_res = send_absentee_alert.delay(
        student_name=student_name,
        parent_phone=payload.parent_phone,
        date_str=payload.date_str
    )

    return {
        "status": "queued",
        "task_id": task_res.id,
        "recipient": payload.parent_phone,
        "message": "Absentee alert queued for delivery via q_urgent worker."
    }

@router.post(
    "/policy-bot",
    response_model=PolicyBotResponse
)
def query_policy_bot_endpoint(payload: PolicyBotQuery, request: Request, db: Session = Depends(get_db)):
    """Query policy chatbot using vector context."""
    center_id = getattr(request.state, "center_id", None)
    return rag_ai.query_policy_bot(db, center_id, payload)

@router.post(
    "/ask-database",
    response_model=TextToSqlResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
)
def ask_database_natural_language(
    payload: TextToSqlRequest,
    db: Session = Depends(get_db)
):
    """
    Super Admin Endpoint: Ask a natural language question about the global finances, 
    and the AI will generate and run the SQL query to answer it.
    """
    return rag_ai.execute_text_to_sql_service(db, payload.question)

@router.post(
    "/text-to-sql",
    response_model=TextToSQLResponse,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def text_to_sql_endpoint(payload: TextToSQLRequest, request: Request, db: Session = Depends(get_db)):
    """Execute safe read-only natural language Text-to-SQL analytics."""
    center_id = getattr(request.state, "center_id", None)
    return rag_ai.execute_text_to_sql(db, center_id, payload)
