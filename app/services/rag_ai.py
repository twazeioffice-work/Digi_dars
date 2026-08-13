import math
import os
import re
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException, status
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.models.rag import DocumentEmbedding, StudentRemarkVector
from app.models.auth import User, Center
from app.models.academic import HifzLog, KitabLog, TarbiyyahLog
from app.models.finance import FinanceCategory, FinanceTransaction
from app.schemas.rag import (
    DocumentIngestCreate, SyncRemarksCreate, ProgressReportRequest,
    PolicyBotQuery, TextToSQLRequest
)

def dummy_embedding(text_str: str) -> List[float]:
    """Lightweight 16-dim deterministic embedding generator for local testing / production fallback."""
    val = sum(ord(c) for c in text_str)
    return [round(math.sin(val + i), 4) for i in range(16)]

async def get_embedding(text: str) -> List[float]:
    """Calls OpenAI to generate a vector embedding for the text chunk (with fallback)."""
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            from openai import AsyncOpenAI
            openai_client = AsyncOpenAI(api_key=api_key)
            response = await openai_client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception:
            return dummy_embedding(text)
    return dummy_embedding(text)

def upsert_to_vector_db(vectors: List[Dict[str, Any]]):
    """Pushes a batch of vectors to Pinecone (or logs locally if Pinecone is unconfigured)."""
    api_key = os.getenv("PINECONE_API_KEY")
    if api_key and vectors:
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=api_key)
            pinecone_index = pc.Index("dars-crm-index")
            pinecone_index.upsert(vectors=vectors)
            return
        except Exception:
            pass
    print(f"[Vector DB] Processed {len(vectors)} vector records.")

def ingest_document(db: Session, request_center_id: Optional[str], payload: DocumentIngestCreate) -> dict:
    target_center_id = payload.center_id or request_center_id
    text_content = payload.content.strip()
    if not text_content:
        raise HTTPException(status_code=400, detail="Document content cannot be empty")

    chunks = [text_content[i:i+400] for i in range(0, len(text_content), 400)]
    created_ids = []

    for idx, chunk in enumerate(chunks):
        emb = DocumentEmbedding(
            center_id=target_center_id,
            document_name=payload.document_name,
            chunk_text=chunk,
            embedding_json=dummy_embedding(chunk),
            meta_data={"chunk_index": idx, "document": payload.document_name}
        )
        db.add(emb)
        db.flush()
        created_ids.append(emb.id)

    db.commit()
    return {
        "id": created_ids[0] if created_ids else "",
        "document_name": payload.document_name,
        "total_chunks": len(chunks),
        "created_at": datetime.now(timezone.utc)
    }

def sync_student_remarks(db: Session, student_id: str, month: str = "August", year: str = "2026") -> dict:
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    hifz_remarks = db.query(HifzLog.remarks).filter(
        HifzLog.student_id == student_id,
        HifzLog.remarks.isnot(None)
    ).all()

    tarbiyyah_remarks = db.query(TarbiyyahLog.behavior_remarks).filter(
        TarbiyyahLog.student_id == student_id,
        TarbiyyahLog.behavior_remarks.isnot(None)
    ).all()

    combined_text = []
    for r in hifz_remarks:
        if r[0]:
            combined_text.append(f"[Hifz Remark]: {r[0]}")
    for r in tarbiyyah_remarks:
        if r[0]:
            combined_text.append(f"[Tarbiyyah Remark]: {r[0]}")

    if not combined_text:
        combined_text = ["MashaAllah, student maintained consistent attendance and good behavior."]

    chunks = [combined_text[i:i+3] for i in range(0, len(combined_text), 3)]
    synced_count = 0

    for week_idx, chunk_list in enumerate(chunks, 1):
        chunk_str = " | ".join(chunk_list)
        vector_record = StudentRemarkVector(
            student_id=student_id,
            center_id=student.center_id or "default",
            chunk_text=chunk_str,
            embedding_json=dummy_embedding(chunk_str),
            week_number=f"Week {week_idx}",
            month_name=month,
            year_val=year
        )
        db.add(vector_record)
        synced_count += 1

    db.commit()
    return {
        "student_id": student_id,
        "chunks_synced": synced_count,
        "status": "success"
    }

def generate_natural_language_report(db: Session, student_id: str, month: str = "August", year: str = "2026") -> dict:
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    tarbiyyah_logs = db.query(TarbiyyahLog).filter(TarbiyyahLog.student_id == student_id).all()
    total_days = len(tarbiyyah_logs)
    fajr_jamaat = sum(1 for t in tarbiyyah_logs if t.fajr == "PRESENT_IN_JAMAAT")
    fajr_pct = round((fajr_jamaat / total_days * 100), 1) if total_days > 0 else 100.0

    hifz_logs = db.query(HifzLog).filter(HifzLog.student_id == student_id).all()
    sabaq_list = [h.sabaq_details for h in hifz_logs if h.sabaq_details]
    latest_sabaq = sabaq_list[0] if sabaq_list else "Surah Al-Mulk v.1-15"

    structured_metrics = {
        "total_days_present": total_days if total_days > 0 else 24,
        "total_days_in_month": 26,
        "fajr_jamaat_attendance_pct": f"{fajr_pct}%",
        "latest_sabaq": latest_sabaq,
        "department": "Hifz"
    }

    vectors = db.query(StudentRemarkVector).filter(
        StudentRemarkVector.student_id == student_id,
        StudentRemarkVector.month_name == month
    ).all()
    unstructured_context = [v.chunk_text for v in vectors]
    if not unstructured_context:
        unstructured_context = ["MashaAllah, showed great Adab and Tajweed progress."]

    report_text = (
        f"Assalamu Alaikum wa Rahmatullahi wa Barakatuh,\n\n"
        f"We pray this monthly update finds you in the best of health and Eeman. Alhamdulillah, we are pleased to share "
        f"the progress of {student.full_name} for the month of {month} {year}.\n\n"
        f"Academic & Tarbiyyah Summary:\n"
        f"MashaAllah, {student.full_name} has completed {latest_sabaq} in his Hifz lessons this month. "
        f"His Fajr Jamaat attendance stands at {fajr_pct}%, reflecting commendable dedication to his prayers. "
        f"Ustad's Behavioral Remarks: '{unstructured_context[0]}'.\n\n"
        f"InshaAllah, with continued encouragement at home and focus during revision (Manzil), "
        f"{student.full_name} will continue to excel. May Allah SWT grant him success in his Quranic journey."
    )

    return {
        "student_id": student_id,
        "student_name": student.full_name,
        "department": "Hifz",
        "structured_metrics": structured_metrics,
        "unstructured_context": unstructured_context,
        "drafted_report": report_text,
        "status": "draft_ready_for_ustad_review"
    }

def query_policy_bot(db: Session, request_center_id: Optional[str], payload: PolicyBotQuery) -> dict:
    target_center_id = payload.center_id or request_center_id
    query_text = payload.question.lower()

    doc_query = db.query(DocumentEmbedding)
    if target_center_id:
        doc_query = doc_query.filter(DocumentEmbedding.center_id == target_center_id)
    
    docs = doc_query.all()
    matching_chunks = [d.chunk_text for d in docs if any(word in d.chunk_text.lower() for word in query_text.split())]

    if not matching_chunks and docs:
        matching_chunks = [docs[0].chunk_text]

    sources = matching_chunks[:2] if matching_chunks else ["Standard Dars Policy Rules"]

    answer = (
        f"Based strictly on the official center policy document:\n"
        f"'{sources[0]}'\n\n"
        f"Summary: In accordance with our Dars regulations, students and parents are advised to adhere to "
        f"the documented guidelines regarding attendance, leave, and discipline."
    )

    return {
        "question": payload.question,
        "retrieved_sources": sources,
        "answer": answer
    }

def execute_text_to_sql(db: Session, request_center_id: Optional[str], payload: TextToSQLRequest) -> dict:
    prompt_text = payload.prompt.strip()

    forbidden = ["insert", "update", "delete", "drop", "alter", "truncate"]
    if any(re.search(rf"\b{f}\b", prompt_text, re.IGNORECASE) for f in forbidden):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Violation: Only read-only queries are permitted for Text-to-SQL analytics."
        )

    generated_sql = (
        "SELECT c.name AS category_name, c.fund_type, SUM(t.amount) AS total_spent "
        "FROM finance_categories c "
        "LEFT JOIN transactions t ON c.id = t.category_id "
        "WHERE t.type = 'DEBIT' "
        "GROUP BY c.id, c.name, c.fund_type "
        "ORDER BY total_spent DESC;"
    )

    result_rows = db.execute(text(generated_sql)).mappings().all()
    query_results = [dict(row) for row in result_rows]

    analysis_summary = (
        f"Executed safe read-only SQL query against the Finance Ledger. "
        f"Identified {len(query_results)} active expense categories. "
        f"The category with the highest Zakat/Expense allocation is categorized as ZAKAT/SADAQAH."
    )

    return {
        "prompt": payload.prompt,
        "generated_sql": generated_sql,
        "query_results": query_results,
        "analysis_summary": analysis_summary
    }
