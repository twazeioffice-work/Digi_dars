import pytest
from unittest.mock import MagicMock
from uuid import uuid4

# Import service & models
from app.services.finance_ledger import record_expense_service, record_income
from app.schemas.finance import ExpenseCreate, IncomeTransactionCreate
from app.models.finance import FinanceCategory, FundCategory
from app.models.auth import StudentProfile, User
from app.core.context import current_tenant_id, current_user_id

@pytest.fixture
def setup_context():
    """Simulates Middleware extracting context variables."""
    tenant_token = current_tenant_id.set(str(uuid4()))
    user_token = current_user_id.set(str(uuid4()))
    yield
    current_tenant_id.reset(tenant_token)
    current_user_id.reset(user_token)

@pytest.fixture
def mock_db_session():
    """Creates a mock Session simulating database operations."""
    return MagicMock()

def test_expense_recording_with_student(setup_context, mock_db_session):
    category_id = str(uuid4())
    student_id = str(uuid4())
    fake_category = FinanceCategory(id=category_id, name="General Utilities", fund_type=FundCategory.GENERAL.value)
    fake_student = User(id=student_id, full_name="Student Hamza", phone="+919876543210")

    expense_data = ExpenseCreate(
        category_id=category_id,
        amount=500.0,
        description="Textbooks and stationery",
        student_id=student_id
    )

    def query_side_effect(model, *args, **kwargs):
        mock_q = MagicMock()
        if model == User:
            mock_q.filter.return_value.first.return_value = fake_student
        else:
            mock_q.filter.return_value.first.return_value = fake_category
        return mock_q

    mock_db_session.query.side_effect = query_side_effect

    result = record_expense_service(mock_db_session, center_id=None, user_id=None, payload=expense_data)
    assert result is not None
    assert result.amount == 500.0
    assert result.student_id == student_id
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()

def test_income_recording_service(setup_context, mock_db_session):
    category_id = str(uuid4())
    fake_category = FinanceCategory(id=category_id, name="Sadaqah", fund_type=FundCategory.SADAQAH.value)

    income_data = IncomeTransactionCreate(
        category_id=category_id,
        amount=1000.0,
        description="Donation for Madrasa building",
        donor_name="Haji Ismail",
        donor_phone="+919998887770"
    )

    mock_db_session.query.return_value.filter.return_value.first.return_value = fake_category

    result = record_income(mock_db_session, center_id="center_1", user_id="user_1", payload=income_data)
    assert result["status"] == "success"
    assert result["data"]["amount"] == 1000.0
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
