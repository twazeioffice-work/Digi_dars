import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_communications.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def test_module4_communications_and_ticketing_flow():
    # Setup
    super_admin = client.post("/api/v1/auth/register", json={
        "email": "hq@comm.org",
        "password": "Password123",
        "full_name": "HQ Super Admin",
        "role": "SUPER_ADMIN"
    }).json()

    super_token = client.post("/api/v1/auth/login", json={
        "email": "hq@comm.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_super = {"Authorization": f"Bearer {super_token}"}

    center = client.post("/api/v1/centers", json={
        "name": "Comm Dars Center",
        "code": "COMM_01"
    }, headers=headers_super).json()
    center_id = center["id"]

    nazim = client.post("/api/v1/auth/register", json={
        "email": "nazim@comm.org",
        "password": "Password123",
        "full_name": "Nazim Sb",
        "role": "NAZIM",
        "center_id": center_id
    }).json()
    nazim_token = client.post("/api/v1/auth/login", json={
        "email": "nazim@comm.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_nazim = {"Authorization": f"Bearer {nazim_token}"}

    ustad = client.post("/api/v1/auth/register", json={
        "email": "ustad@comm.org",
        "password": "Password123",
        "full_name": "Ustad Bilal",
        "role": "USTAD",
        "center_id": center_id
    }).json()
    ustad_token = client.post("/api/v1/auth/login", json={
        "email": "ustad@comm.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_ustad = {"Authorization": f"Bearer {ustad_token}"}

    parent = client.post("/api/v1/auth/register", json={
        "email": "parent@comm.org",
        "password": "Password123",
        "full_name": "Father Parent",
        "role": "PARENT",
        "center_id": center_id
    }).json()
    parent_token = client.post("/api/v1/auth/login", json={
        "email": "parent@comm.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_parent = {"Authorization": f"Bearer {parent_token}"}

    student = client.post("/api/v1/auth/register", json={
        "email": "student@comm.org",
        "password": "Password123",
        "full_name": "Son Student",
        "role": "STUDENT",
        "center_id": center_id
    }).json()

    # Flow 1: Create Internal Ticket (Ustad ➝ Nazim)
    ticket_res = client.post("/api/v1/communication/internal-tickets", json={
        "subject": "Need 5 copies of Hidayah Vol 1",
        "description": "Five new students have joined the morning Halqa and do not have the kitab. Please arrange from the library.",
        "category": "ACADEMIC_SUPPLIES"
    }, headers=headers_ustad)
    assert ticket_res.status_code == 201
    ticket_json = ticket_res.json()
    assert ticket_json["status"] == "success"
    ticket_id = ticket_json["data"]["ticket_id"]
    assert ticket_json["data"]["status"] == "OPEN"

    # Nazim Resolves Ticket
    resolve_res = client.patch(f"/api/v1/communication/internal-tickets/{ticket_id}/status", json={
        "status": "RESOLVED"
    }, headers=headers_nazim)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

    # Flow 2: Send Broadcast (Nazim ➝ Parents)
    broadcast_res = client.post("/api/v1/communication/broadcasts", json={
        "audience": "SPECIFIC_HALQA",
        "target_halqa_id": "hq-1234abcd-5678",
        "subject": "Change in Asr Timing",
        "message": "Respected Parents, Asr Jamaat timing for the Hifz batch will shift to 5:00 PM starting tomorrow."
    }, headers=headers_nazim)
    assert broadcast_res.status_code == 201
    bc_json = broadcast_res.json()
    assert bc_json["status"] == "success"
    assert bc_json["message"] == "Broadcast queued for delivery"
    assert bc_json["data"]["audience"] == "SPECIFIC_HALQA"

    # Flow 3: Academic Direct Message (Ustad ↔ Parent)
    from app.services.communications import get_or_create_thread
    db = next(override_get_db())
    try:
        thread = get_or_create_thread(db, center_id, ustad["id"], student["id"])
        thread_id = thread.id
    finally:
        db.close()

    msg_res = client.post(f"/api/v1/communication/threads/{thread_id}/messages", json={
        "message": "Assalamu Alaikum. Abdullah has completed Surah Rahman today. Please listen to his revision at home this weekend."
    }, headers=headers_ustad)
    assert msg_res.status_code == 201
    msg_json = msg_res.json()
    assert msg_json["status"] == "success"
    assert msg_json["data"]["thread_id"] == thread_id

    # Flow 4: Submit Escalation (Parent ➝ Super Admin)
    escalation_res = client.post("/api/v1/communication/escalations", json={
        "subject": "Recurring issue with boarding food quality",
        "complaint_details": "I have raised this twice with the local Nazim, but the meals provided to the Hifz students late at night are consistently stale. Requesting HQ intervention."
    }, headers=headers_parent)
    assert escalation_res.status_code == 201
    esc_json = escalation_res.json()
    assert esc_json["status"] == "success"
    assert "Super Admin Headquarters" in esc_json["message"]
    assert esc_json["data"]["status"] == "OPEN"

    # RLS Security Check: Local Nazim attempt to view HQ Escalations MUST be BLOCKED (403 Forbidden)
    blocked_res = client.get("/api/v1/communication/escalations", headers=headers_nazim)
    assert blocked_res.status_code == 403
    assert "not authorized" in blocked_res.json()["detail"]

    # Super Admin can view HQ Escalations
    hq_res = client.get("/api/v1/communication/escalations", headers=headers_super)
    assert hq_res.status_code == 200
    assert len(hq_res.json()) >= 1

    # Public Inquiry Auto-Routing
    local_inquiry = client.post("/api/v1/communication/inquiries", json={
        "name": "Applicant Parent",
        "email": "applicant@gmail.com",
        "message": "Requesting admission details",
        "center_id": center_id
    }).json()
    assert local_inquiry["routed_to"] == "LOCAL_NAZIM"

    hq_inquiry = client.post("/api/v1/communication/inquiries", json={
        "name": "Franchise Investor",
        "email": "investor@gmail.com",
        "message": "Franchise inquiry",
        "center_id": None
    }).json()
    assert hq_inquiry["routed_to"] == "SUPER_ADMIN"
