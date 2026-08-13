from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
import enum
import uuid
from app.database import Base

def generate_uuid_str():
    return str(uuid.uuid4())

class TransactionType(str, enum.Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"

class FundCategory(str, enum.Enum):
    ZAKAT = "ZAKAT"
    SADAQAH = "SADAQAH"
    LILLAH = "LILLAH"
    WAQF = "WAQF"
    GENERAL_FEE = "GENERAL_FEE"

class FinanceCategory(Base):
    __tablename__ = "finance_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    fund_type = Column(String(50), nullable=False)  # ZAKAT, SADAQAH, LILLAH, WAQF, GENERAL_FEE
    is_active = Column(Boolean, default=True)  # Used instead of DELETE
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("center_id", "name", name="uq_center_category_name"),
    )

    transactions = relationship("FinanceTransaction", back_populates="category")

class FinanceTransaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="RESTRICT"), nullable=False)
    category_id = Column(String(36), ForeignKey("finance_categories.id", ondelete="RESTRICT"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(50), nullable=False)  # CREDIT or DEBIT
    student_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    description = Column(String(1000), nullable=False)
    receipt_url = Column(String(512), nullable=True)
    recorded_by = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    reversal_for_id = Column(String(36), ForeignKey("transactions.id", ondelete="RESTRICT"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    category = relationship("FinanceCategory", back_populates="transactions")
    student = relationship("User", foreign_keys=[student_id])
    recorder = relationship("User", foreign_keys=[recorded_by])
    reversed_transaction = relationship("FinanceTransaction", remote_side=[id])
