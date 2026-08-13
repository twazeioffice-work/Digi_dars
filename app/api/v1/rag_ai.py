from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.rag import (
    DocumentIngestCreate, DocumentIngestResponse,
    SyncRemarksCreate, SyncRemarksResponse,
    ProgressReportRequest, ProgressReportResponse,
    PolicyBotQuery, PolicyBotResponse,
    TextToSQLRequest, TextToSQLResponse
)
from app.services import rag_ai
from app.core.guards import role_guard

router = APIRouter(prefix="/v1/ai", tags=["Module 5: RAG & AI Processing"])

@router.post(
    "/documents/ingest",
    response_model=DocumentIngestResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def ingest_document_endpoint(payload: DocumentIngestCreate, request: Request, db: Session = Depends(get_db)):
    """(Admin / Nazim Only) Upload and chunk school policy PDFs/rulebooks into the Vector DB."""
    center_id = request.state.center_id
    return rag_ai.ingest_document(db, center_id, payload)

@router.post(
    "/students/{student_id}/sync-remarks",
    response_model=SyncRemarksResponse,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def sync_student_remarks_endpoint(student_id: str, payload: SyncRemarksCreate, db: Session = Depends(get_db)):
    """(Ustad / Background Worker) Vectorize and sync Ustad's monthly unstructured remarks into Vector DB."""
    month = payload.month or "August"
    year = payload.year or "2026"
    return rag_ai.sync_student_remarks(db, student_id, month, year)

@router.post(
    "/reports/generate",
    response_model=ProgressReportResponse,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def generate_natural_language_report_endpoint(payload: ProgressReportRequest, db: Session = Depends(get_db)):
    """(Ustad Only) Hybrid RAG pipeline combining structured DB stats & vector remarks to draft a progress report."""
    month = payload.month or "August"
    year = payload.year or "2026"
    return rag_ai.generate_natural_language_report(db, payload.student_id, month, year)

@router.post(
    "/policy-bot",
    response_model=PolicyBotResponse
)
def query_policy_bot_endpoint(payload: PolicyBotQuery, request: Request, db: Session = Depends(get_db)):
    """RAG Policy Bot answering parent questions strictly from vectorized center rulebooks."""
    center_id = request.state.center_id
    return rag_ai.query_policy_bot(db, center_id, payload)

@router.post(
    "/text-to-sql",
    response_model=TextToSQLResponse,
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
)
def execute_text_to_sql_endpoint(payload: TextToSQLRequest, request: Request, db: Session = Depends(get_db)):
    """(Super Admin Only) Translate natural language analytics prompts into safe read-only SQL queries against Finance Ledger."""
    center_id = request.state.center_id
    return rag_ai.execute_text_to_sql(db, center_id, payload)
