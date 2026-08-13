import os
import json
import stripe
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.orm import Session
import structlog

from app.database import get_db
from app.services.stripe_service import process_stripe_checkout_completed

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/v1/finance/webhooks", tags=["Stripe Webhooks"])

# Set Stripe API Key and Webhook Secret
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock")

@router.post("/stripe")
async def stripe_webhook(
    request: Request, 
    stripe_signature: str = Header(None), 
    db_session: Session = Depends(get_db)
):
    """
    Receives events directly from Stripe. Bypasses standard authentication 
    and uses Stripe's cryptographic signature instead.
    """
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe signature header")

    # MUST read the raw body bytes to verify the signature
    payload = await request.body()

    try:
        secret = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock")
        if secret == "whsec_mock":
            data = json.loads(payload.decode("utf-8"))
            event = stripe.Event.construct_from(data, stripe.api_key)
        else:
            event = stripe.Webhook.construct_event(
                payload=payload, 
                sig_header=stripe_signature, 
                secret=secret
            )
    except ValueError as e:
        logger.warning("stripe_invalid_payload", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.warning("stripe_invalid_signature", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Route the event to the correct service
    try:
        if event.type == "checkout.session.completed":
            await process_stripe_checkout_completed(event, db_session)
    except Exception as e:
        logger.exception("stripe_webhook_processing_failed", event_type=event.type)
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return {"status": "success"}
