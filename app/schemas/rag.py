from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentIngestCreate(BaseModel):
    document_name: str
    content: str
    center_id: Optional[str] = None

class DocumentIngestResponse(BaseModel):
    id: str
    document_name: str
    total_chunks: int
    created_at: datetime

class SyncRemarksCreate(BaseModel):
    student_id: str
    month: Optional[str] = "August"
    year: Optional[str] = "2026"

class SyncRemarksResponse(BaseModel):
    student_id: str
    chunks_synced: int
    status: str = "success"

class ProgressReportRequest(BaseModel):
    student_id: str
    month: Optional[str] = "August"
    year: Optional[str] = "2026"

class ProgressReportResponse(BaseModel):
    student_id: str
    student_name: str
    department: str
    structured_metrics: Dict[str, Any]
    unstructured_context: List[str]
    drafted_report: str
    status: str = "draft_ready_for_ustad_review"

class PolicyBotQuery(BaseModel):
    question: str
    center_id: Optional[str] = None

class PolicyBotResponse(BaseModel):
    question: str
    retrieved_sources: List[str]
    answer: str

class TextToSQLRequest(BaseModel):
    prompt: str

class TextToSQLResponse(BaseModel):
    prompt: str
    generated_sql: str
    query_results: List[Dict[str, Any]]
    analysis_summary: str
