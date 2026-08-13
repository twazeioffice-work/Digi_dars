import json
import os
from fastapi import APIRouter, Request, Response, Depends, status
from sqlalchemy.orm import Session
from fastapi_limiter.depends import RateLimiter

from app.database import get_db
from app.services.whatsapp_service import process_incoming_whatsapp

router = APIRouter(prefix="/v1/whatsapp", tags=["WhatsApp Bot"])

VERIFY_TOKEN = os.getenv("WA_VERIFY_TOKEN", "default_verify_token")

# Custom identifier function to extract the sender's phone number
async def whatsapp_phone_identifier(request: Request) -> str:
    try:
        body = await request.body()
        if body:
            payload = json.loads(body)
            entry = payload.get("entry", [])[0]
            changes = entry.get("changes", [])[0]
            phone_number = changes.get("value", {}).get("messages", [])[0].get("from")
            if phone_number:
                return f"wa_limit_{phone_number}"
    except Exception:
        pass
        
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "127.0.0.1"

@router.get("/webhook")
async def verify_webhook(request: Request):
    """
    Meta sends a GET request to verify the webhook URL.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        # Must return the challenge as plain text to pass Meta's check
        return Response(content=challenge, media_type="text/plain")
    
    return Response(status_code=status.HTTP_403_FORBIDDEN)

@router.post(
    "/webhook",
    dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=whatsapp_phone_identifier))]
)
async def receive_message(request: Request, db_session: Session = Depends(get_db)):
    """
    Receives incoming WhatsApp messages from Parents.
    """
    payload = await request.json()

    try:
        entry = payload.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        if messages:
            message = messages[0]
            raw_from = str(message.get('from', ''))
            phone_number = raw_from if raw_from.startswith("+") else f"+{raw_from}"
            incoming_text = message.get("text", {}).get("body", "")

            if incoming_text:
                await process_incoming_whatsapp(db_session, phone_number, incoming_text)

    except (IndexError, KeyError, TypeError):
        pass

    return {"status": "ok"}
