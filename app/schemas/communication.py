from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

class InternalTicketCreate(BaseModel):
    subject: str
    description: str
    center_id: Optional[str] = None

class InternalTicketStatusUpdate(BaseModel):
    status: str  # OPEN, IN_PROGRESS, RESOLVED, CLOSED

class InternalTicketResponse(BaseModel):
    id: str
    center_id: str
    ustad_id: str
    subject: str
    description: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BroadcastNoticeCreate(BaseModel):
    audience: str  # "All Parents", "Hifz Batch Parents"
    message: str
    center_id: Optional[str] = None

class BroadcastNoticeResponse(BaseModel):
    id: str
    center_id: str
    audience: str
    message: str
    created_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProgressUpdateCreate(BaseModel):
    student_id: str
    message: str

class ProgressReplyCreate(BaseModel):
    reply_text: str

class ProgressReplyResponse(BaseModel):
    id: str
    message_id: str
    sender_id: str
    reply_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProgressMessageResponse(BaseModel):
    id: str
    student_id: str
    ustad_id: str
    parent_id: Optional[str] = None
    message: str
    replies: List[ProgressReplyResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EscalationCreate(BaseModel):
    subject: str
    grievance_description: str
    priority: Optional[str] = "URGENT"

class EscalationResponse(BaseModel):
    id: str
    user_id: str
    center_id: Optional[str] = None
    subject: str
    grievance_description: str
    priority: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    center_id: Optional[str] = None  # If null -> routes to Super Admin

class InquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    center_id: Optional[str] = None
    routed_to: str  # "LOCAL_NAZIM" or "SUPER_ADMIN"
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
