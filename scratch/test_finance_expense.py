import sys
from app.database import SessionLocal
from app.services.finance_ledger import record_expense
from app.schemas.finance import ExpenseCreate

db = SessionLocal()
try:
    print("Testing record_expense with center_id=None...")
    payload = ExpenseCreate(
        amount=250.0,
        fund_type="SADAQAH",
        category_name="STIPEND",
        description="Test expense disbursement",
        recipient_name="Test Recipient",
        recipient_phone="+919123456789"
    )
    result = record_expense(db=db, center_id=None, user_id=None, payload=payload)
    print("SUCCESS! Expense recorded:", result.id, result.amount, result.recipient_name)
except Exception as e:
    print("ERROR:", e)
    import traceback
    traceback.print_exc()
finally:
    db.close()
