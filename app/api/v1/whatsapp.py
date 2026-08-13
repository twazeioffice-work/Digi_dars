import json
import os
from typing import Optional, List
from fastapi import APIRouter, Request, Response, Depends, status, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.communication import WhatsAppMessage
from app.models.auth import User, Center
from app.core.guards import role_guard
from app.core.context import current_user_id, current_tenant_id
from app.services.whatsapp_service import process_incoming_whatsapp, send_usthad_whatsapp_reply

router = APIRouter(prefix="/v1/whatsapp", tags=["WhatsApp Bot & Parent Communication Pipeline"])

VERIFY_TOKEN = os.getenv("WA_VERIFY_TOKEN", "default_verify_token")

class WhatsAppReplyRequest(BaseModel):
    recipient_phone: str
    message_text: str
    student_id: Optional[str] = None

@router.get("/webhook")
async def verify_webhook(request: Request):
    """Meta sends a GET request to verify the webhook URL."""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")
    return Response(status_code=status.HTTP_403_FORBIDDEN)

@router.post("/webhook")
async def receive_message(request: Request, db_session: Session = Depends(get_db)):
    """Receives incoming WhatsApp messages from Parents via WABA Webhook."""
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

@router.post("/reply")
async def usthad_reply_whatsapp(
    payload: WhatsAppReplyRequest,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["USTAD", "NAZIM", "SUPER_ADMIN"]))]
):
    """
    Usthad replies directly from CRM dashboard back to Parent's WhatsApp chat.
    Uses Meta Cloud API to dispatch message and logs entry in database.
    """
    ustad_id = current_user_id.get() or "SYSTEM"
    return await send_usthad_whatsapp_reply(
        db,
        ustad_id=ustad_id,
        recipient_phone=payload.recipient_phone,
        reply_text=payload.message_text,
        student_id=payload.student_id
    )

@router.get("/messages")
def get_whatsapp_messages(
    recipient_phone: Optional[str] = None,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["USTAD", "NAZIM", "SUPER_ADMIN"]))]
):
    """Retrieve WhatsApp communication thread for Usthad or Admin console."""
    query = db.query(WhatsAppMessage)
    if recipient_phone:
        query = query.filter(
            (WhatsAppMessage.sender_phone == recipient_phone) |
            (WhatsAppMessage.recipient_phone == recipient_phone)
        )
    if student_id:
        query = query.filter(WhatsAppMessage.student_id == student_id)

    messages = query.order_by(WhatsAppMessage.created_at.asc()).all()

    results = []
    for m in messages:
        results.append({
            "id": m.id,
            "center_id": m.center_id,
            "sender_phone": m.sender_phone,
            "recipient_phone": m.recipient_phone,
            "direction": m.direction,
            "message_text": m.message_text,
            "student_id": m.student_id,
            "ustad_id": m.ustad_id,
            "is_complaint": m.is_complaint,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })

    return results

@router.get("/super-admin/oversight")
def get_super_admin_whatsapp_oversight(
    db: Session = Depends(get_db),
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
):
    """
    (Super Admin HQ Only) Retrieve real-time communication oversight log across all centers.
    """
    messages = db.query(WhatsAppMessage).order_by(WhatsAppMessage.created_at.desc()).limit(100).all()
    results = []
    for m in messages:
        center = db.query(Center).filter(Center.id == m.center_id).first() if m.center_id else None
        student = db.query(User).filter(User.id == m.student_id).first() if m.student_id else None
        results.append({
            "id": m.id,
            "center_name": center.name if center else "Global",
            "student_name": student.full_name if student else "Unmapped Parent",
            "sender_phone": m.sender_phone,
            "recipient_phone": m.recipient_phone,
            "direction": m.direction,
            "message_text": m.message_text,
            "is_complaint": m.is_complaint,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })
    return results
