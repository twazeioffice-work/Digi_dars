from fastapi import APIRouter, Depends, Query, status, Request
from sqlalchemy.orm import Session
from typing import Optional, Union
from datetime import datetime
from app.database import get_db
from app.schemas.finance import (
    CategoryCreate, IncomeTransactionCreate, ExpenseCreate, ExpenseTransactionCreate, ReversalRequest, TransactionResponse
)
from app.services import finance_ledger
from app.core.guards import role_guard

router = APIRouter(prefix="/v1/finance", tags=["Module 2: Immutable Finance Ledger"])

@router.post(
    "/categories",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def create_finance_category_endpoint(
    request: Request,
    payload: CategoryCreate,
    db: Session = Depends(get_db)
):
    """(Nazim / Admin Only) Create a new financial category."""
    center_id = request.state.center_id
    user_id = request.state.user_id
    cat = finance_ledger.create_finance_category(db, center_id, user_id, payload)
    return {
        "status": "success",
        "data": {
            "category_id": cat.id,
            "name": cat.name,
            "fund_type": cat.fund_type,
            "is_active": cat.is_active,
            "created_at": cat.created_at
        }
    }

@router.get(
    "/categories",
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "USTAD"]))]
)
def get_finance_categories_endpoint(request: Request, db: Session = Depends(get_db)):
    """Fetch active financial categories for current center."""
    center_id = request.state.center_id
    categories = finance_ledger.get_finance_categories(db, center_id)
    return {
        "status": "success",
        "data": [
            {
                "category_id": c.id,
                "name": c.name,
                "fund_type": c.fund_type,
                "is_active": c.is_active,
                "created_at": c.created_at
            }
            for c in categories
        ]
    }

@router.post(
    "/transactions/income",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def record_income_endpoint(
    request: Request,
    payload: IncomeTransactionCreate,
    db: Session = Depends(get_db)
):
    """(Nazim / Admin Only) Record incoming funds (CREDIT)."""
    center_id = request.state.center_id
    user_id = request.state.user_id
    return finance_ledger.record_income(db, center_id, user_id, payload)

@router.post(
    "/transactions/expense",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def record_expense_endpoint(
    request: Request,
    payload: Union[ExpenseCreate, ExpenseTransactionCreate],
    db: Session = Depends(get_db)
):
    """(Nazim / Admin Only) Record outgoing funds (DEBIT). Enforces Zakat student eligibility verification."""
    center_id = getattr(request.state, "center_id", None)
    user_id = getattr(request.state, "user_id", None)
    tx = finance_ledger.record_expense(db, center_id, user_id, payload)
    return {
        "status": "success",
        "data": {
            "transaction_id": tx.id,
            "id": tx.id,
            "type": tx.type,
            "amount": tx.amount,
            "category_id": tx.category_id,
            "category_name": getattr(tx.category, "name", ""),
            "description": tx.description,
            "student_id": tx.student_id,
            "created_at": tx.created_at
        }
    }

@router.post(
    "/transactions/{transaction_id}/reverse",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def reverse_transaction_endpoint(
    transaction_id: str,
    payload: ReversalRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """(Nazim / Admin Only) Reverse an existing transaction by creating a balancing entry."""
    center_id = request.state.center_id
    user_id = request.state.user_id
    return finance_ledger.reverse_transaction(db, center_id, user_id, transaction_id, payload)

@router.get(
    "/transactions",
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def get_ledger_endpoint(
    request: Request,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    fund_type: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Fetch categorized financial ledger with net balance summary."""
    center_id = request.state.center_id
    return finance_ledger.get_ledger(
        db=db,
        center_id=center_id,
        start_date=start_date,
        end_date=end_date,
        fund_type=fund_type,
        student_id=student_id,
        page=page,
        limit=limit
    )

@router.get(
    "/student-statement/{student_id}",
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM", "PARENT", "STUDENT"]))]
)
def generate_student_financial_statement_endpoint(
    student_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Fetch individual student financial statement."""
    center_id = request.state.center_id
    return finance_ledger.generate_student_financial_statement(db, center_id, student_id)
