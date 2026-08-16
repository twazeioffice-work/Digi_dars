import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from app.models.auth import User, Center
from app.models.enums import UserRole

client = TestClient(app)

def test_verify_webhook_success():
    with patch("app.api.v1.whatsapp.VERIFY_TOKEN", "test_token"):
        response = client.get(
            "/api/v1/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "test_token",
                "hub.challenge": "123456789"
            }
        )
        assert response.status_code == 200
        assert response.text == "123456789"

def test_verify_webhook_forbidden():
    with patch("app.api.v1.whatsapp.VERIFY_TOKEN", "correct_token"):
        response = client.get(
            "/api/v1/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "wrong_token",
                "hub.challenge": "123456789"
            }
        )
        assert response.status_code == 403

@patch("app.services.whatsapp_service.send_whatsapp_message", new_callable=AsyncMock)
def test_receive_whatsapp_message_unregistered(mock_send):
    payload = {
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{
                        "from": "919999999999",
                        "text": {"body": "Salam"}
                    }]
                }
            }]
        }]
    }
    response = client.post("/api/v1/whatsapp/webhook", json=payload)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_send.assert_called_once()
    assert "not registered as a Parent" in mock_send.call_args[0][1]

@patch("app.services.whatsapp_service.send_whatsapp_message", new_callable=AsyncMock)
def test_receive_whatsapp_message_registered_parent(mock_send):
    db_session = next(get_db())
    center = db_session.query(Center).first()
    if not center:
        center = Center(name="WhatsApp Test Center", code="WA_01")
        db_session.add(center)
        db_session.commit()
        db_session.refresh(center)

    parent = db_session.query(User).filter(User.phone == "+919876543210").first()
    if not parent:
        parent = User(
            center_id=center.id,
            role=UserRole.PARENT.value,
            full_name="Tariq Ahmad",
            phone="+919876543210",
            email="tariq.wa@example.com",
            hashed_password="hashedpassword"
        )
        db_session.add(parent)
        db_session.commit()

    payload = {
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{
                        "from": "919876543210",
                        "text": {"body": "1"}
                    }]
                }
            }]
        }]
    }
    response = client.post("/api/v1/whatsapp/webhook", json=payload)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_send.assert_called_once()
    assert "Present" in mock_send.call_args[0][1]
