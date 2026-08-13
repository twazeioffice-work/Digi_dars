from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
import enum
from app.database import Base, TenantBase, generate_uuid_str

class TransactionType(str, enum.Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"

class FundCategory(str, enum.Enum):
    ZAKAT = "ZAKAT"
    SADAQAH = "SADAQAH"
    LILLAH = "LILLAH"
    WAQF = "WAQF"
    GENERAL_FEE = "GENERAL_FEE"

class FinanceCategory(TenantBase):
    __tablename__ = "finance_categories"

    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    fund_type = Column(String(50), nullable=False)  # ZAKAT, SADAQAH, LILLAH, WAQF, GENERAL_FEE
    is_active = Column(Boolean, default=True)  # Used instead of DELETE
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        UniqueConstraint("center_id", "name", name="uq_center_category_name"),
    )

    transactions = relationship("FinanceTransaction", back_populates="category")

class FinanceTransaction(TenantBase):
    __tablename__ = "transactions"

    center_id = Column(String(36), ForeignKey("centers.id", ondelete="RESTRICT"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("finance_categories.id", ondelete="RESTRICT"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(50), nullable=False)  # CREDIT or DEBIT
    student_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    description = Column(String(1000), nullable=False)
    receipt_url = Column(String(512), nullable=True)
    recorded_by = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    reversal_for_id = Column(String(36), ForeignKey("transactions.id", ondelete="RESTRICT"), nullable=True)

    category = relationship("FinanceCategory", back_populates="transactions")
    student = relationship("User", foreign_keys=[student_id])
    recorder = relationship("User", foreign_keys=[recorded_by])
    reversed_transaction = relationship("FinanceTransaction", remote_side="FinanceTransaction.id")
