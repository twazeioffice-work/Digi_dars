"""
WhatsApp Communication & Complaints Module (Studio Panel Reference)
Bridges WABA Webhooks, automatic Parent-Student-Teacher mapping,
Usthad CRM reply engine, and confidential Direct-to-Super-Admin complaint pipeline.
"""

from app.models.communication import WhatsAppMessage
from app.models.complaint import Complaint, ComplaintStatus
from app.services.whatsapp_service import process_incoming_whatsapp, send_usthad_whatsapp_reply

__all__ = [
    "WhatsAppMessage",
    "Complaint",
    "ComplaintStatus",
    "process_incoming_whatsapp",
    "send_usthad_whatsapp_reply"
]
