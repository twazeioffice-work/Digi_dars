import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_rag_ai.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

client = TestClient(app)

def test_module5_rag_and_ai_flow():
    # Setup
    super_admin = client.post("/api/v1/auth/register", json={
        "email": "hq@ai.org",
        "password": "Password123",
        "full_name": "AI Super Admin",
        "role": "SUPER_ADMIN"
    }).json()

    super_token = client.post("/api/v1/auth/login", json={
        "email": "hq@ai.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_super = {"Authorization": f"Bearer {super_token}"}

    center = client.post("/api/v1/centers", json={
        "name": "AI Test Center",
        "code": "AI_01"
    }, headers=headers_super).json()
    center_id = center["id"]

    ustad = client.post("/api/v1/auth/register", json={
        "email": "ustad@ai.org",
        "password": "Password123",
        "full_name": "Hafiz Ahmad",
        "role": "USTAD",
        "center_id": center_id
    }).json()
    ustad_token = client.post("/api/v1/auth/login", json={
        "email": "ustad@ai.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_ustad = {"Authorization": f"Bearer {ustad_token}"}

    student = client.post("/api/v1/auth/register", json={
        "email": "student@ai.org",
        "password": "Password123",
        "full_name": "Abdullah Zaid",
        "role": "STUDENT",
        "center_id": center_id
    }).json()

    # Log Hifz and Tarbiyyah data for student
    client.post("/api/v1/academic/hifz/progress", json={
        "student_id": student["id"],
        "sabaq": "Surah Al-Mulk v.1-12",
        "remarks": "Tajweed is improving, especially Makharij MashaAllah"
    }, headers=headers_ustad)

    client.post("/api/v1/academic/tarbiyyah", json={
        "student_id": student["id"],
        "fajr": "PRESENT_JAMAAT",
        "behavioral_remarks": "Helped junior students in boarding area"
    }, headers=headers_ustad)

    # 1. Document Ingestion (Policy Rulebook)
    doc_res = client.post("/api/v1/ai/documents/ingest", json={
        "document_name": "Center Rules and Regulations 2026.pdf",
        "content": "Rule 1: All students must attend Fajr Jamaat punctually. Rule 2: Leave requires prior approval from Nazim.",
        "center_id": center_id
    }, headers=headers_super)
    assert doc_res.status_code == 201
    assert doc_res.json()["total_chunks"] >= 1

    # 2. Sync Student Remarks (Vectorizing Ustad remarks)
    sync_res = client.post(f"/api/v1/ai/students/{student['id']}/sync-remarks", json={
        "student_id": student["id"],
        "month": "August",
        "year": "2026"
    }, headers=headers_ustad)
    assert sync_res.status_code == 200
    assert sync_res.json()["chunks_synced"] >= 1

    # 3. Hybrid RAG Progress Report Generation
    report_res = client.post("/api/v1/ai/reports/generate", json={
        "student_id": student["id"],
        "month": "August",
        "year": "2026"
    }, headers=headers_ustad)
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert "Assalamu Alaikum" in report_data["drafted_report"]
    assert "MashaAllah" in report_data["drafted_report"]
    assert report_data["status"] == "draft_ready_for_ustad_review"

    # 4. Policy Chatbot Query
    bot_res = client.post("/api/v1/ai/policy-bot", json={
        "question": "What is the rule regarding Fajr attendance?",
        "center_id": center_id
    })
    assert bot_res.status_code == 200
    assert "rule" in bot_res.json()["answer"].lower() or "center policy" in bot_res.json()["answer"].lower()

    # 5. Text-to-SQL Analytics
    sql_res = client.post("/api/v1/ai/text-to-sql", json={
        "prompt": "Which categories have the highest expense to Zakat ratio?"
    }, headers=headers_super)
    assert sql_res.status_code == 200
    assert "SELECT" in sql_res.json()["generated_sql"]

    # Test Security blocking destructive SQL
    forbidden_sql_res = client.post("/api/v1/ai/text-to-sql", json={
        "prompt": "DROP TABLE transactions;"
    }, headers=headers_super)
    assert forbidden_sql_res.status_code == 400
    assert "Security Violation" in forbidden_sql_res.json()["detail"]
