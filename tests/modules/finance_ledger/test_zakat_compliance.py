import pytest
from unittest.mock import MagicMock
from uuid import uuid4
from fastapi import HTTPException

# Import service & models
from app.services.finance_ledger import record_expense_service
from app.schemas.finance import ExpenseCreate
from app.models.finance import FinanceCategory, FundCategory
from app.models.auth import StudentProfile
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

def test_zakat_expense_fails_without_student_id(setup_context, mock_db_session):
    # 1. Arrange: ZAKAT category and expense payload with NO student_id
    category_id = str(uuid4())
    fake_category = FinanceCategory(id=category_id, fund_type=FundCategory.ZAKAT.value)
    
    expense_data = ExpenseCreate(
        category_id=category_id,
        amount=500.0,
        description="Buying books",
        student_id=None
    )

    mock_db_session.query.return_value.filter.return_value.first.return_value = fake_category

    # 2 & 3. Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        record_expense_service(mock_db_session, center_id=None, user_id=None, payload=expense_data)
    
    assert exc_info.value.status_code == 400
    assert "Zakat expenses must be allocated to a specific student" in str(exc_info.value.detail)

def test_zakat_expense_fails_for_ineligible_student(setup_context, mock_db_session):
    # 1. Arrange: Student is INELIGIBLE for Zakat
    category_id = str(uuid4())
    student_id = str(uuid4())
    
    fake_category = FinanceCategory(id=category_id, fund_type=FundCategory.ZAKAT.value)
    fake_student = StudentProfile(user_id=student_id, is_zakat_eligible=False)

    expense_data = ExpenseCreate(
        category_id=category_id,
        amount=500.0,
        description="Buying books",
        student_id=student_id
    )

    def query_side_effect(model, *args, **kwargs):
        mock_q = MagicMock()
        if model == StudentProfile:
            mock_q.filter.return_value.first.return_value = fake_student
        else:
            mock_q.filter.return_value.first.return_value = fake_category
        return mock_q

    mock_db_session.query.side_effect = query_side_effect

    # 2 & 3. Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        record_expense_service(mock_db_session, center_id=None, user_id=None, payload=expense_data)
    
    assert exc_info.value.status_code == 403

def test_zakat_expense_succeeds_for_eligible_student(setup_context, mock_db_session):
    # 1. Arrange: Student is ELIGIBLE for Zakat
    category_id = str(uuid4())
    student_id = str(uuid4())
    
    fake_category = FinanceCategory(id=category_id, fund_type=FundCategory.ZAKAT.value)
    fake_student = StudentProfile(user_id=student_id, is_zakat_eligible=True)

    expense_data = ExpenseCreate(
        category_id=category_id,
        amount=500.0,
        description="Buying books",
        student_id=student_id
    )

    def query_side_effect(model, *args, **kwargs):
        mock_q = MagicMock()
        if model == StudentProfile:
            mock_q.filter.return_value.first.return_value = fake_student
        else:
            mock_q.filter.return_value.first.return_value = fake_category
        return mock_q

    mock_db_session.query.side_effect = query_side_effect

    # 2. Act
    result_transaction = record_expense_service(mock_db_session, center_id=None, user_id=None, payload=expense_data)

    # 3. Assert
    assert result_transaction is not None
    assert result_transaction.amount == 500.0
    assert result_transaction.student_id == student_id
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
