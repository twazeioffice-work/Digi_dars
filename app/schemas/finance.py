from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from uuid import UUID

class CategoryCreate(BaseModel):
    name: str
    fund_type: str  # ZAKAT, SADAQAH, LILLAH, WAQF, GENERAL_FEE

class CategoryResponseData(BaseModel):
    category_id: str
    name: str
    fund_type: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CategoryResponseWrapper(BaseModel):
    status: str = "success"
    data: CategoryResponseData

class ExpenseCreate(BaseModel):
    category_id: Optional[Union[UUID, str]] = None
    fund_type: Optional[str] = "ZAKAT"
    category_name: Optional[str] = "STIPEND"
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    description: str
    receipt_url: Optional[str] = None
    student_id: Optional[Union[UUID, str]] = None

class ExpenseTransactionCreate(ExpenseCreate):
    pass

class IncomeTransactionCreate(BaseModel):
    category_id: Optional[Union[UUID, str]] = None
    fund_type: Optional[str] = "ZAKAT"
    category_name: Optional[str] = "DONATION"
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    description: str
    receipt_url: Optional[str] = None
    student_id: Optional[Union[UUID, str]] = None

class TransactionResponse(BaseModel):
    id: Union[UUID, str]
    category_id: Union[UUID, str]
    amount: float
    type: str
    description: str
    student_id: Optional[Union[UUID, str]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TransactionDataResponse(BaseModel):
    transaction_id: str
    type: str  # CREDIT or DEBIT
    amount: float
    category_name: str
    description: Optional[str] = None
    student_id: Optional[str] = None
    recorded_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TransactionResponseWrapper(BaseModel):
    status: str = "success"
    data: TransactionDataResponse

class ReversalRequest(BaseModel):
    reason: str = Field(..., min_length=10, description="Detailed reason for the reversal")

class ReversalDataResponse(BaseModel):
    reversal_transaction_id: str
    reversal_for_id: str
    type: str
    amount: float
    description: str
    created_at: datetime

class ReversalResponseWrapper(BaseModel):
    status: str = "success"
    message: str = "Transaction successfully reversed."
    data: ReversalDataResponse

class LedgerSummary(BaseModel):
    total_credit: float
    total_debit: float
    net_balance: float
    fund_type_filtered: Optional[str] = None

class PaginationInfo(BaseModel):
    page: int
    limit: int
    total_records: int

class LedgerResponseWrapper(BaseModel):
    status: str = "success"
    summary: LedgerSummary
    data: List[Dict[str, Any]]
    pagination: PaginationInfo

class CenterZakatSummary(BaseModel):
    center_id: Union[UUID, str]
    center_name: str
    total_collected: float
    total_spent: float
    balance: float

class GlobalZakatStatsResponse(BaseModel):
    global_collected: float
    global_spent: float
    global_balance: float
    centers_breakdown: List[CenterZakatSummary]
