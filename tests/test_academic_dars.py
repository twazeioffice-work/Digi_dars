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

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

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
        "name": "Hifz & Aalim Academy",
        "code": "ACADEMY_01"
    }, headers=headers_super).json()
    center_id = center["id"]

    ustad = client.post("/api/v1/auth/register", json={
        "email": "ustad@academy.org",
        "password": "Password123",
        "full_name": "Hafiz Ahmad",
        "role": "USTAD",
        "center_id": center_id
    }).json()
    ustad_token = client.post("/api/v1/auth/login", json={
        "email": "ustad@academy.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_ustad = {"Authorization": f"Bearer {ustad_token}"}

    student1 = client.post("/api/v1/auth/register", json={
        "email": "student1@academy.org",
        "password": "Password123",
        "full_name": "Abdullah Zaid",
        "role": "STUDENT",
        "center_id": center_id
    }).json()

    student2 = client.post("/api/v1/auth/register", json={
        "email": "student2@academy.org",
        "password": "Password123",
        "full_name": "Bilal Umar",
        "role": "STUDENT",
        "center_id": center_id
    }).json()

    # 1. Create Halqa (Batch)
    halqa_res = client.post("/api/v1/academic/halqas", json={
        "name": "Hifz Batch A - Morning",
        "department": "HIFZ",
        "center_id": center_id,
        "ustad_id": ustad["id"]
    }, headers=headers_super)
    assert halqa_res.status_code == 201
    halqa_id = halqa_res.json()["id"]

    # 2. Enroll Students in Halqa
    enroll_res1 = client.post("/api/v1/academic/halqas/enroll", json={
        "student_id": student1["id"],
        "halqa_id": halqa_id,
        "status": "ACTIVE"
    }, headers=headers_super)
    assert enroll_res1.status_code == 201

    enroll_res2 = client.post("/api/v1/academic/halqas/enroll", json={
        "student_id": student2["id"],
        "halqa_id": halqa_id,
        "status": "ACTIVE"
    }, headers=headers_super)
    assert enroll_res2.status_code == 201

    # 3. Record Hifz Log with Mastery Level Grades
    hifz_res = client.post("/api/v1/academic/hifz/logs", json={
        "student_id": student1["id"],
        "sabaq_details": "Surah Yaseen Ayah 1-12",
        "sabaq_grade": "EXCELLENT",
        "sabqi_details": "Surah At-Tahrim",
        "sabqi_grade": "GOOD",
        "manzil_details": "Juz 28",
        "manzil_grade": "EXCELLENT",
        "remarks": "Makharij on Qalqalah improving MashaAllah"
    }, headers=headers_ustad)
    assert hifz_res.status_code == 201
    assert hifz_res.json()["sabaq_grade"] == "EXCELLENT"

    # 4. Record Kitab Log (Mutala'a & Comprehension)
    kitab_res = client.post("/api/v1/academic/kitab/logs", json={
        "student_id": student2["id"],
        "kitab_name": "Mishkat-ul-Masabih",
        "chapter_or_topic": "Kitab-us-Salah",
        "mutalaa_completed": True,
        "comprehension_grade": "EXCELLENT",
        "remarks": "Great understanding of Hadith text"
    }, headers=headers_ustad)
    assert kitab_res.status_code == 201
    assert kitab_res.json()["mutalaa_completed"] is True

    # 5. Bulk Tarbiyyah Logging (entire Halqa) with Leave Override & Vector Sync Hook
    bulk_tarbiyyah_res = client.post("/api/v1/academic/tarbiyyah/bulk", json={
        "entries": [
            {
                "student_id": student1["id"],
                "is_on_leave": False,
                "fajr": "PRESENT_IN_JAMAAT",
                "zuhr": "PRESENT_IN_JAMAAT",
                "asr": "PRESENT_IN_JAMAAT",
                "maghrib": "PRESENT_IN_JAMAAT",
                "isha": "PRESENT_IN_JAMAAT",
                "adab_score": 5,
                "behavior_remarks": "Helped clean the Wudu area today MashaAllah."
            },
            {
                "student_id": student2["id"],
                "is_on_leave": True,  # Leave Override: Skips prayer statuses
                "adab_score": 5,
                "behavior_remarks": "On approved leave for family function."
            }
        ]
    }, headers=headers_ustad)
    assert bulk_tarbiyyah_res.status_code == 201
    tarbiyyah_logs = bulk_tarbiyyah_res.json()
    assert len(tarbiyyah_logs) == 2
    assert tarbiyyah_logs[0]["fajr"] == "PRESENT_IN_JAMAAT"
    assert tarbiyyah_logs[1]["is_on_leave"] is True
    assert tarbiyyah_logs[1]["fajr"] is None  # Leave override nullified prayer status

    # 6. Leave Request Submission & Approval
    leave_res = client.post("/api/v1/academic/leave-requests", json={
        "student_id": student2["id"],
        "start_date": "2026-08-20",
        "end_date": "2026-08-22",
        "reason": "Family wedding in hometown"
    }, headers=headers_ustad)
    assert leave_res.status_code == 201
    leave_id = leave_res.json()["id"]

    approve_res = client.patch(f"/api/v1/academic/leave-requests/{leave_id}/approve", json={
        "status": "APPROVED"
    }, headers=headers_super)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 7. Academic History Retrieval
    history_res = client.get(f"/api/v1/academic/students/{student1['id']}/history", headers=headers_ustad)
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert len(history_data["hifz_logs"]) == 1
    assert len(history_data["tarbiyyah_logs"]) == 1
