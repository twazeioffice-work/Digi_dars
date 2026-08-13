from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import Optional, Union
from datetime import datetime

from app.core.context import current_tenant_id, current_user_id
from app.models.finance import FinanceCategory, FinanceTransaction, TransactionType, FundCategory
from app.models.auth import StudentProfile, User
from app.schemas.finance import CategoryCreate, IncomeTransactionCreate, ExpenseTransactionCreate, ExpenseCreate, ReversalRequest

def create_finance_category(db: Session, center_id: str, user_id: str, payload: CategoryCreate) -> FinanceCategory:
    fund_upper = payload.fund_type.upper()
    if fund_upper not in [f.value for f in FundCategory]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid fund_type '{payload.fund_type}'. Allowed: {[f.value for f in FundCategory]}"
        )
    
    existing = db.query(FinanceCategory).filter(
        FinanceCategory.center_id == center_id,
        FinanceCategory.name == payload.name
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{payload.name}' already exists for this center"
        )
    
    category = FinanceCategory(
        center_id=center_id,
        name=payload.name,
        fund_type=fund_upper,
        is_active=True,
        created_by=user_id
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def get_finance_categories(db: Session, center_id: str):
    return db.query(FinanceCategory).filter(
        FinanceCategory.center_id == center_id,
        FinanceCategory.is_active == True
    ).all()

def record_income(db: Session, center_id: str, user_id: str, payload: IncomeTransactionCreate) -> dict:
    category = db.query(FinanceCategory).filter(
        FinanceCategory.id == str(payload.category_id),
        FinanceCategory.center_id == center_id
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finance category '{payload.category_id}' not found"
        )

    if payload.student_id:
        student = db.query(User).filter(User.id == str(payload.student_id)).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with id '{payload.student_id}' not found"
            )

    transaction = FinanceTransaction(
        center_id=center_id,
        category_id=str(payload.category_id),
        amount=payload.amount,
        type=TransactionType.CREDIT.value,
        student_id=str(payload.student_id) if payload.student_id else None,
        description=payload.description,
        receipt_url=payload.receipt_url,
        recorded_by=user_id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {
        "status": "success",
        "data": {
            "transaction_id": transaction.id,
            "type": transaction.type,
            "amount": transaction.amount,
            "category_name": category.name,
            "description": transaction.description,
            "recorded_by": transaction.recorded_by,
            "created_at": transaction.created_at
        }
    }

def record_expense(db: Session, center_id: str, user_id: str, payload: Union[ExpenseCreate, ExpenseTransactionCreate]) -> FinanceTransaction:
    t_id = center_id or current_tenant_id.get()
    u_id = user_id or current_user_id.get()

    category = db.query(FinanceCategory).filter(
        FinanceCategory.id == str(payload.category_id),
        FinanceCategory.center_id == t_id
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance category not found."
        )

    # RELIGIOUS COMPLIANCE & ZAKAT ELIGIBILITY CHECK
    if category.fund_type == FundCategory.ZAKAT.value:
        if not payload.student_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Zakat expenses must be allocated to a specific student. student_id is missing."
            )
        
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == str(payload.student_id)).first()
        if not student_profile or not student_profile.is_zakat_eligible:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "status": "error",
                    "error_code": "ZAKAT_COMPLIANCE_VIOLATION",
                    "message": "Religious Compliance Violation: This student is not marked as Zakat-eligible.",
                    "details": {
                        "student_id": str(payload.student_id),
                        "is_zakat_eligible": False
                    }
                }
            )

    transaction = FinanceTransaction(
        center_id=t_id,
        category_id=str(payload.category_id),
        amount=payload.amount,
        type=TransactionType.DEBIT.value,
        student_id=str(payload.student_id) if payload.student_id else None,
        description=payload.description,
        receipt_url=payload.receipt_url,
        recorded_by=u_id or "SYSTEM"
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction

# DDD Application Service alias
record_expense_service = record_expense

def reverse_transaction(db: Session, center_id: str, user_id: str, transaction_id: str, payload: ReversalRequest) -> FinanceTransaction:
    t_id = center_id or current_tenant_id.get()
    u_id = user_id or current_user_id.get()

    original_txn = db.query(FinanceTransaction).filter(
        FinanceTransaction.id == str(transaction_id),
        FinanceTransaction.center_id == t_id
    ).first()
    if not original_txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original transaction not found."
        )

    # Prevent reversing a transaction that is already a reversal entry
    if original_txn.reversal_for_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reverse a transaction that is already a reversal entry."
        )

    # Check if this transaction has already been reversed
    existing_reversal = db.query(FinanceTransaction).filter(
        FinanceTransaction.reversal_for_id == str(transaction_id)
    ).first()
    if existing_reversal:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This transaction has already been reversed."
        )

    new_type = TransactionType.CREDIT.value if original_txn.type == TransactionType.DEBIT.value else TransactionType.DEBIT.value

    reversal_txn = FinanceTransaction(
        center_id=t_id,
        category_id=original_txn.category_id,
        amount=original_txn.amount,
        type=new_type,
        student_id=original_txn.student_id,
        description=f"[REVERSAL] {payload.reason} | Original Ref: {original_txn.id}",
        receipt_url=original_txn.receipt_url,
        recorded_by=u_id or "SYSTEM",
        reversal_for_id=original_txn.id
    )
    db.add(reversal_txn)
    db.commit()
    db.refresh(reversal_txn)

    return reversal_txn

# DDD Application Service alias
reverse_transaction_service = reverse_transaction

def get_ledger(
    db: Session,
    center_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    fund_type: Optional[str] = None,
    student_id: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> dict:
    query = db.query(FinanceTransaction).join(FinanceCategory).filter(
        FinanceTransaction.center_id == center_id
    )

    if start_date:
        query = query.filter(FinanceTransaction.created_at >= start_date)
    if end_date:
        query = query.filter(FinanceTransaction.created_at <= end_date)
    if fund_type:
        query = query.filter(FinanceCategory.fund_type == fund_type.upper())
    if student_id:
        query = query.filter(FinanceTransaction.student_id == student_id)

    total_records = query.count()

    transactions = query.order_by(FinanceTransaction.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    total_credit = sum(t.amount for t in transactions if t.type == TransactionType.CREDIT.value)
    total_debit = sum(t.amount for t in transactions if t.type == TransactionType.DEBIT.value)
    net_balance = total_credit - total_debit

    data_list = []
    for t in transactions:
        data_list.append({
            "transaction_id": t.id,
            "date": t.created_at,
            "type": t.type,
            "category_name": t.category.name if t.category else "Uncategorized",
            "amount": t.amount,
            "student_id": t.student_id,
            "description": t.description
        })

    return {
        "status": "success",
        "summary": {
            "total_credit": total_credit,
            "total_debit": total_debit,
            "net_balance": net_balance,
            "fund_type_filtered": fund_type.upper() if fund_type else None
        },
        "data": data_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_records": total_records
        }
    }

def generate_student_financial_statement(db: Session, center_id: str, student_id: str) -> dict:
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{student_id}' not found"
        )
    return get_ledger(db=db, center_id=center_id, student_id=student_id, page=1, limit=100)
