import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_academic_dars.db"

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

def test_module3_academic_and_tarbiyyah_flow():
    # Setup
    super_admin = client.post("/api/v1/auth/register", json={
        "email": "admin@academic.org",
        "password": "Password123",
        "full_name": "Academic Admin",
        "role": "SUPER_ADMIN"
    }).json()

    super_token = client.post("/api/v1/auth/login", json={
        "email": "admin@academic.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_super = {"Authorization": f"Bearer {super_token}"}

    center = client.post("/api/v1/centers", json={
        "name": "Hifz Academy",
        "code": "HIFZ_01"
    }, headers=headers_super).json()
    center_id = center["id"]

    ustad = client.post("/api/v1/auth/register", json={
        "email": "ustad@hifz.org",
        "password": "Password123",
        "full_name": "Hafiz Ahmad",
        "role": "USTAD",
        "center_id": center_id
    }).json()
    ustad_token = client.post("/api/v1/auth/login", json={
        "email": "ustad@hifz.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_ustad = {"Authorization": f"Bearer {ustad_token}"}

    student = client.post("/api/v1/auth/register", json={
        "email": "student@hifz.org",
        "password": "Password123",
        "full_name": "Abdullah Zaid",
        "role": "STUDENT",
        "center_id": center_id
    }).json()

    # 1. Create Halqa (Batch)
    halqa_res = client.post("/api/v1/academic/halqas", json={
        "name": "Hifz Batch A",
        "department": "Hifz",
        "ustad_id": ustad["id"]
    }, headers=headers_super)
    assert halqa_res.status_code == 201
    halqa_id = halqa_res.json()["id"]

    # 2. Enroll Student in Halqa
    enroll_res = client.post("/api/v1/academic/halqas/enroll", json={
        "student_id": student["id"],
        "halqa_id": halqa_id
    }, headers=headers_super)
    assert enroll_res.status_code == 201
    assert enroll_res.json()["student_id"] == student["id"]

    # 3. Record Hifz Progress (Sabaq, Sabqi, Manzil)
    hifz_res = client.post("/api/v1/academic/hifz/progress", json={
        "student_id": student["id"],
        "sabaq": "Surah Al-Mulk v.1-15",
        "sabqi": "Surah At-Tahrim",
        "manzil": "Juz 28",
        "remarks": "Makharij on Qalqalah improving MashaAllah"
    }, headers=headers_ustad)
    assert hifz_res.status_code == 201
    assert hifz_res.json()["sabaq"] == "Surah Al-Mulk v.1-15"

    # 4. Log Daily Tarbiyyah (5 Daily Prayers + Behavior Remarks)
    tarbiyyah_res = client.post("/api/v1/academic/tarbiyyah", json={
        "student_id": student["id"],
        "fajr": "PRESENT_JAMAAT",
        "dhuhr": "PRESENT_JAMAAT",
        "asr": "PRESENT_JAMAAT",
        "maghrib": "PRESENT_JAMAAT",
        "isha": "MISSED",
        "behavioral_remarks": "Helped junior students in boarding area MashaAllah"
    }, headers=headers_ustad)
    assert tarbiyyah_res.status_code == 201
    assert tarbiyyah_res.json()["isha"] == "MISSED"

    # 5. Submit Leave Request (Chutti)
    leave_res = client.post("/api/v1/academic/leave-requests", json={
        "student_id": student["id"],
        "start_date": "2026-08-20",
        "end_date": "2026-08-22",
        "reason": "Family wedding in hometown"
    }, headers=headers_ustad)
    assert leave_res.status_code == 201
    leave_id = leave_res.json()["id"]
    assert leave_res.json()["status"] == "PENDING"

    # 6. Approve Leave Request
    approve_res = client.patch(f"/api/v1/academic/leave-requests/{leave_id}/approve", json={
        "status": "APPROVED"
    }, headers=headers_super)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 7. Get Student Academic History
    history_res = client.get(f"/api/v1/academic/students/{student['id']}/history", headers=headers_ustad)
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert len(history_data["hifz_logs"]) == 1
    assert len(history_data["tarbiyyah_logs"]) == 1
