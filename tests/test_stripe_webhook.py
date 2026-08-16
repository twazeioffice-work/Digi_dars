import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from app.models.auth import Center
from app.models.finance import FinanceTransaction, FundCategory

client = TestClient(app)

def test_stripe_webhook_missing_signature():
    response = client.post("/api/v1/finance/webhooks/stripe", json={})
    assert response.status_code == 400
    assert "Missing Stripe signature header" in response.json()["detail"]

def test_stripe_webhook_checkout_completed():
    db_session = next(get_db())
    center = db_session.query(Center).first()
    if not center:
        center = Center(name="Stripe Test Center", code="STRIPE_01")
        db_session.add(center)
        db_session.commit()
        db_session.refresh(center)

    assert center is not None

    payload = {
        "id": "evt_test_123",
        "object": "event",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_abc123",
                "object": "checkout.session",
                "amount_total": 50000,
                "currency": "inr",
                "payment_intent": "pi_3MtwBwLkdIwHu7ix08W4i9g",
                "metadata": {
                    "center_id": center.id,
                    "student_id": "student-uuid-123",
                    "fund_type": FundCategory.GENERAL.value
                }
            }
        }
    }

    response = client.post(
        "/api/v1/finance/webhooks/stripe",
        json=payload,
        headers={"Stripe-Signature": "t=12345,v1=mock_signature"}
    )
    assert response.status_code == 200
    assert response.json() == {"status": "success"}

    # Verify transaction was recorded in DB
    tx = db_session.query(FinanceTransaction).filter(
        FinanceTransaction.center_id == center.id,
        FinanceTransaction.amount == 500.0
    ).first()
    assert tx is not None
    assert tx.type == "CREDIT"
    assert tx.recorded_by == "SYSTEM_STRIPE"
    assert "pi_3MtwBwLkdIwHu7ix08W4i9g" in tx.description
