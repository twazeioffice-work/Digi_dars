import sys
from app.database import SessionLocal
from app.services.finance_ledger import record_income
from app.schemas.finance import IncomeTransactionCreate

db = SessionLocal()
try:
    print("Testing record_income with center_id=None...")
    payload = IncomeTransactionCreate(
        amount=500.0,
        fund_type="ZAKAT",
        category_name="DONATION",
        description="Test income collection",
        donor_name="Test Donor",
        donor_phone="+919876543210"
    )
    result = record_income(db=db, center_id=None, user_id=None, payload=payload)
    print("SUCCESS! Transaction recorded:", result)
except Exception as e:
    print("ERROR:", e)
    import traceback
    traceback.print_exc()
finally:
    db.close()
