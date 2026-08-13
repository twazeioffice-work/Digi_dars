import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth_tenant.db"

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

def test_module1_auth_and_tenant_flow():
    # 1. Register Super Admin
    super_admin_payload = {
        "email": "superadmin@digidars.org",
        "password": "SuperSecretPassword123",
        "full_name": "Global Super Admin",
        "role": "SUPER_ADMIN"
    }
    res = client.post("/api/v1/auth/register", json=super_admin_payload)
    assert res.status_code == 201
    super_admin_data = res.json()
    assert super_admin_data["role"] == "SUPER_ADMIN"

    # 2. Login Super Admin to get token
    login_res = client.post("/api/v1/auth/login", json={
        "email": "superadmin@digidars.org",
        "password": "SuperSecretPassword123"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    super_token = token_data["access_token"]
    headers_super = {"Authorization": f"Bearer {super_token}"}

    # 3. Create Dars Center (Super Admin Only)
    center_payload = {
        "name": "Masjid Al-Noor Dars Center",
        "code": "MASJID_NOOR_01",
        "address": "123 Quranic Way, City",
        "capacity": 150
    }
    center_res = client.post("/api/v1/centers", json=center_payload, headers=headers_super)
    assert center_res.status_code == 201
    center_data = center_res.json()
    center_id = center_data["id"]
    assert isinstance(center_id, str)
    assert center_data["code"] == "MASJID_NOOR_01"

    # 4. Get Center Details
    details_res = client.get(f"/api/v1/centers/{center_id}")
    assert details_res.status_code == 200
    assert details_res.json()["capacity"] == 150

    # 5. Register Center Admin, Ustad, Parent, Student under Center
    admin_user = client.post("/api/v1/auth/register", json={
        "email": "admin@noor.org",
        "password": "AdminPassword123",
        "full_name": "Nazim Sb",
        "role": "CENTER_ADMIN",
        "center_id": center_id
    }).json()

    parent_user = client.post("/api/v1/auth/register", json={
        "email": "parent@gmail.com",
        "password": "ParentPassword123",
        "full_name": "Tariq Ahmad (Parent)",
        "role": "PARENT",
        "center_id": center_id
    }).json()

    student_user = client.post("/api/v1/auth/register", json={
        "email": "student@noor.org",
        "password": "StudentPassword123",
        "full_name": "Hamza Tariq (Student)",
        "role": "STUDENT",
        "center_id": center_id,
        "is_zakat_eligible": True
    }).json()
    assert student_user["student_profile"]["is_zakat_eligible"] is True

    # 6. Login as Student and verify role guard blocks center creation
    student_login = client.post("/api/v1/auth/login", json={
        "email": "student@noor.org",
        "password": "StudentPassword123"
    }).json()
    student_headers = {"Authorization": f"Bearer {student_login['access_token']}"}

    forbidden_res = client.post("/api/v1/centers", json={
        "name": "Unauthorized Center",
        "code": "UNAUTH_01"
    }, headers=student_headers)
    assert forbidden_res.status_code == 403

    # 7. Link Parent to Student (Authorized Admin)
    link_res = client.post("/api/v1/parents/link-student", json={
        "parent_id": parent_user["id"],
        "student_id": student_user["id"],
        "relation_type": "FATHER"
    }, headers=headers_super)
    assert link_res.status_code == 201
    assert link_res.json()["parent_id"] == parent_user["id"]
    assert link_res.json()["student_id"] == student_user["id"]
    assert link_res.json()["relation_type"] == "FATHER"

    # 8. Update Center Status (Suspend Center)
    suspend_res = client.patch(
        f"/api/v1/centers/{center_id}/status",
        json={"status": "SUSPENDED"},
        headers=headers_super
    )
    assert suspend_res.status_code == 200
    assert suspend_res.json()["status"] == "SUSPENDED"

    # 9. Login for center user should be blocked when center is suspended
    suspended_login = client.post("/api/v1/auth/login", json={
        "email": "student@noor.org",
        "password": "StudentPassword123"
    })
    assert suspended_login.status_code == 403
    assert "suspended" in suspended_login.json()["detail"].lower()
