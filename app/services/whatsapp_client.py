import os
import httpx
import structlog

logger = structlog.get_logger(__name__)

# Load from environment variables
WA_PHONE_NUMBER_ID = os.getenv("WA_PHONE_NUMBER_ID", "default_phone_id")
WA_ACCESS_TOKEN = os.getenv("WA_ACCESS_TOKEN", "default_access_token")

async def send_whatsapp_message(to_phone_number: str, message_text: str):
    """Sends a text message via Meta's WhatsApp Cloud API."""
    url = f"https://graph.facebook.com/v17.0/{WA_PHONE_NUMBER_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WA_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone_number,
        "type": "text",
        "text": {"body": message_text}
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                logger.error("whatsapp_send_failed", error=response.text, phone=to_phone_number)
            return response
    except Exception as e:
        logger.error("whatsapp_send_exception", error=str(e), phone=to_phone_number)
        return None
