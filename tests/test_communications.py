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

    # Link Parent & Student
    client.post("/api/v1/parents/link-student", json={
        "parent_id": parent["id"],
        "student_id": student["id"],
        "relation_type": "FATHER"
    }, headers=headers_super)

    # 1. Internal Staff Ticket (Ustad -> Nazim)
    ticket_res = client.post("/api/v1/communications/tickets", json={
        "subject": "Need new Mishkat-ul-Masabih copies",
        "description": "Boarding students require 5 new copies of Mishkat."
    }, headers=headers_ustad)
    assert ticket_res.status_code == 201
    ticket_id = ticket_res.json()["id"]
    assert ticket_res.json()["status"] == "OPEN"

    # Update Ticket Status (Resolve)
    resolve_res = client.patch(f"/api/v1/communications/tickets/{ticket_id}/status", json={
        "status": "RESOLVED"
    }, headers=headers_super)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

    # 2. Broadcast Notice (Admin -> Parents)
    broadcast_res = client.post("/api/v1/communications/broadcasts", json={
        "audience": "All Parents",
        "message": "Assalamu Alaikum. Center will remain closed for Eid holidays from Friday.",
        "center_id": center_id
    }, headers=headers_super)
    assert broadcast_res.status_code == 201
    assert broadcast_res.json()["audience"] == "All Parents"

    # 3. Academic Update (Ustad -> Parent) & Reply
    progress_res = client.post("/api/v1/communications/progress-updates", json={
        "student_id": student["id"],
        "message": "Assalamu Alaikum. Son Student's Tajweed is improving MashaAllah."
    }, headers=headers_ustad)
    assert progress_res.status_code == 201
    msg_id = progress_res.json()["id"]

    reply_res = client.post(f"/api/v1/communications/progress-updates/{msg_id}/reply", json={
        "reply_text": "JazakAllah Khair Ustad ji. We will revise at home as well."
    }, headers=headers_parent)
    assert reply_res.status_code == 201
    assert reply_res.json()["reply_text"] == "JazakAllah Khair Ustad ji. We will revise at home as well."

    # 4. Super Admin Escalation (Bypasses center filter)
    escalation_res = client.post("/api/v1/communications/escalations", json={
        "subject": "Urgent Facilities Grievance",
        "grievance_description": "Water filtration unit requires immediate maintenance.",
        "priority": "URGENT"
    }, headers=headers_parent)
    assert escalation_res.status_code == 201
    assert escalation_res.json()["priority"] == "URGENT"

    # 5. Public Inquiry Routing
    # Case A: Center ID provided -> Route to LOCAL_NAZIM
    local_inquiry = client.post("/api/v1/communications/inquiries", json={
        "name": "Applicant Parent",
        "email": "applicant@gmail.com",
        "phone": "+919876543210",
        "message": "Requesting admission details for Hifz class",
        "center_id": center_id
    }).json()
    assert local_inquiry["routed_to"] == "LOCAL_NAZIM"

    # Case B: Center ID null -> Route to SUPER_ADMIN
    hq_inquiry = client.post("/api/v1/communications/inquiries", json={
        "name": "Franchise Investor",
        "email": "investor@gmail.com",
        "message": "Requesting new Dars center franchise information",
        "center_id": None
    }).json()
    assert hq_inquiry["routed_to"] == "SUPER_ADMIN"
