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

    model_config = ConfigDict(from_attributes=True)

class SyncRemarksCreate(BaseModel):
    student_id: str
    month: Optional[str] = "August"
    year: Optional[str] = "2026"

class ProgressReportRequest(BaseModel):
    student_id: str
    month: Optional[str] = "August"
    year: Optional[str] = "2026"

class BatchReportRequest(BaseModel):
    halqa_id: str
    month: Optional[str] = "August"
    year: Optional[str] = "2026"

class BatchReportResponse(BaseModel):
    status: str = "queued"
    halqa_id: str
    total_students: int
    master_task_id: str
    message: str = "Batch AI report generation queued. The API returned 202 Accepted. Celery workers will process reports asynchronously."

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

class AbsenteeAlertCreate(BaseModel):
    student_id: str
    parent_phone: str
    date_str: str
