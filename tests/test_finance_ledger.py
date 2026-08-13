import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_finance_ledger.db"

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

def test_module2_finance_ledger_flow():
    # Setup: Create Center and Users
    super_admin = client.post("/api/v1/auth/register", json={
        "email": "superadmin@finance.org",
        "password": "Password123",
        "full_name": "Super Admin",
        "role": "SUPER_ADMIN"
    }).json()

    super_token = client.post("/api/v1/auth/login", json={
        "email": "superadmin@finance.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_super = {"Authorization": f"Bearer {super_token}"}

    center = client.post("/api/v1/centers", json={
        "name": "Finance Test Center",
        "code": "FINANCE_01"
    }, headers=headers_super).json()
    center_id = center["id"]

    # Register Nazim
    nazim = client.post("/api/v1/auth/register", json={
        "email": "nazim@finance.org",
        "password": "Password123",
        "full_name": "Nazim Sb",
        "role": "NAZIM",
        "center_id": center_id
    }).json()

    nazim_token = client.post("/api/v1/auth/login", json={
        "email": "nazim@finance.org",
        "password": "Password123"
    }).json()["access_token"]
    headers_nazim = {"Authorization": f"Bearer {nazim_token}"}

    # Register Zakat-Eligible Student
    student_zakat = client.post("/api/v1/auth/register", json={
        "email": "zakat_student@finance.org",
        "password": "Password123",
        "full_name": "Zakat Student",
        "role": "STUDENT",
        "center_id": center_id,
        "is_zakat_eligible": True
    }).json()

    # Register Non-Zakat Eligible Student
    student_wealthy = client.post("/api/v1/auth/register", json={
        "email": "wealthy_student@finance.org",
        "password": "Password123",
        "full_name": "Non-Zakat Student",
        "role": "STUDENT",
        "center_id": center_id,
        "is_zakat_eligible": False
    }).json()

    # 1. Create Finance Categories (ZAKAT & LILLAH)
    zakat_cat_res = client.post("/api/v1/finance/categories", json={
        "name": "Zakat Fund - Boarding Ration",
        "fund_type": "ZAKAT"
    }, headers=headers_nazim)
    assert zakat_cat_res.status_code == 201
    zakat_cat_id = zakat_cat_res.json()["data"]["category_id"]

    lillah_cat_res = client.post("/api/v1/finance/categories", json={
        "name": "Lillah - General Utilities",
        "fund_type": "LILLAH"
    }, headers=headers_nazim)
    assert lillah_cat_res.status_code == 201
    lillah_cat_id = lillah_cat_res.json()["data"]["category_id"]

    # 2. Record Income (CREDIT)
    income_res = client.post("/api/v1/finance/transactions/income", json={
        "category_id": lillah_cat_id,
        "amount": 5000.00,
        "description": "Donation received from Haji Abdul Rahman",
        "receipt_url": "https://storage.provider.com/receipts/inc_1029.pdf"
    }, headers=headers_nazim)
    assert income_res.status_code == 201
    assert income_res.json()["data"]["type"] == "CREDIT"
    assert income_res.json()["data"]["amount"] == 5000.00

    # 3. Record Zakat Expense on Non-Zakat Student -> Expect 403 Forbidden Religious Compliance Violation
    zakat_violation_res = client.post("/api/v1/finance/transactions/expense", json={
        "category_id": zakat_cat_id,
        "amount": 1200.00,
        "description": "Boarding ration",
        "student_id": student_wealthy["id"]
    }, headers=headers_nazim)
    assert zakat_violation_res.status_code == 403
    error_detail = zakat_violation_res.json()["detail"]
    assert error_detail["error_code"] == "ZAKAT_COMPLIANCE_VIOLATION"

    # 4. Record Zakat Expense on Zakat-Eligible Student -> Expect 201 Created Success
    zakat_valid_res = client.post("/api/v1/finance/transactions/expense", json={
        "category_id": zakat_cat_id,
        "amount": 1200.00,
        "description": "Purchase of Mishkat-ul-Masabih and uniform for boarding student",
        "receipt_url": "https://storage.provider.com/receipts/exp_4051.pdf",
        "student_id": student_zakat["id"]
    }, headers=headers_nazim)
    assert zakat_valid_res.status_code == 201
    zakat_tx_data = zakat_valid_res.json()["data"]
    assert zakat_tx_data["type"] == "DEBIT"
    assert zakat_tx_data["amount"] == 1200.00
    zakat_tx_id = zakat_tx_data["transaction_id"]

    # 5. Reverse Zakat Expense Transaction (Immutability pattern)
    reversal_res = client.post(f"/api/v1/finance/transactions/{zakat_tx_id}/reverse", json={
        "reason": "Accidentally entered 1200 instead of 120. Reversing to correct."
    }, headers=headers_nazim)
    assert reversal_res.status_code == 201
    reversal_data = reversal_res.json()["data"]
    assert reversal_data["reversal_for_id"] == zakat_tx_id
    assert reversal_data["type"] == "CREDIT"
    assert reversal_data["amount"] == 1200.00

    # 6. Fetch Ledger Summary & Transactions
    ledger_res = client.get("/api/v1/finance/transactions", headers=headers_nazim)
    assert ledger_res.status_code == 200
    summary = ledger_res.json()["summary"]
    assert summary["total_credit"] == 6200.00
    assert summary["total_debit"] == 1200.00
    assert summary["net_balance"] == 5000.00
