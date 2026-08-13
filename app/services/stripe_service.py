import stripe
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.middleware import current_tenant_id, current_user_id
from app.models.finance import FinanceCategory, FinanceTransaction, TransactionType, FundCategory

logger = structlog.get_logger(__name__)

def _get_val(obj, key, default=None):
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    val = getattr(obj, key, default)
    return val if val is not None else default

async def process_stripe_checkout_completed(event: stripe.Event, db_session: Session):
    """
    Parses a successful Stripe payment and records it in the immutable ledger.
    """
    session = _get_val(event, "data", {})
    if not isinstance(session, dict):
        session = _get_val(session, "object", session)

    metadata = _get_val(session, "metadata", {})

    center_id_str = _get_val(metadata, "center_id")
    student_id_str = _get_val(metadata, "student_id")
    fund_type_str = _get_val(metadata, "fund_type", FundCategory.GENERAL_FEE.value)

    session_id = _get_val(session, "id")

    if not center_id_str:
        logger.error("stripe_webhook_missing_center_id", stripe_session_id=session_id)
        return

    # 1. Inject Context for Multi-Tenancy
    current_tenant_id.set(center_id_str)
    current_user_id.set("SYSTEM_STRIPE") 

    # Stripe amounts are in cents/paise. Convert to standard currency
    amount_total = _get_val(session, "amount_total", 0)
    amount = float(amount_total) / 100.0  
    currency = str(_get_val(session, "currency", "USD")).upper()

    # 2. Find or create the correct ledger category for this Center
    stmt = select(FinanceCategory).where(
        FinanceCategory.center_id == center_id_str,
        FinanceCategory.fund_type == fund_type_str
    )
    category = db_session.execute(stmt).scalar_one_or_none()

    if not category:
        category = FinanceCategory(
            center_id=center_id_str, 
            name=f"Online {fund_type_str} Payments", 
            fund_type=fund_type_str
        )
        db_session.add(category)
        db_session.flush()

    # 3. Create the Immutable Ledger Entry
    payment_intent = _get_val(session, "payment_intent") or session_id
    new_transaction = FinanceTransaction(
        center_id=center_id_str,
        category_id=category.id,
        student_id=student_id_str,
        type=TransactionType.CREDIT.value,
        amount=amount,
        description=f"Stripe Payment via Checkout ({currency}) - {payment_intent}",
        receipt_url=None,
        recorded_by="SYSTEM_STRIPE",
        reversal_for_id=None
    )

    db_session.add(new_transaction)
    db_session.commit()

    logger.info(
        "stripe_payment_recorded", 
        center_id=str(center_id_str), 
        amount=amount, 
        fund_type=fund_type_str
    )
