from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from uuid import UUID

# --- Flow 1: Internal Tickets ---
class InternalTicketCreate(BaseModel):
    subject: str
    description: str
    category: Optional[str] = "GENERAL"  # MAINTENANCE, ACADEMIC_SUPPLIES, LEAVE_REQUEST

class InternalTicketResponseData(BaseModel):
    ticket_id: str
    subject: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InternalTicketResponseWrapper(BaseModel):
    status: str = "success"
    data: InternalTicketResponseData

class TicketStatusUpdate(BaseModel):
    status: str  # OPEN, IN_PROGRESS, RESOLVED, CLOSED

# --- Flow 2: Broadcasts ---
class BroadcastCreate(BaseModel):
    audience: str  # ALL_PARENTS, HIFZ_PARENTS, AALIM_PARENTS, SPECIFIC_HALQA
    target_halqa_id: Optional[str] = None
    subject: str
    message: str

class BroadcastResponseData(BaseModel):
    broadcast_id: str
    audience: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BroadcastResponseWrapper(BaseModel):
    status: str = "success"
    message: str = "Broadcast queued for delivery"
    data: BroadcastResponseData

# --- Flow 3: Academic Threads & Direct Messages ---
class ThreadCreate(BaseModel):
    student_id: str

class AcademicMessageCreate(BaseModel):
    message: str

class ApprovedReportRequest(BaseModel):
    final_text: str = Field(..., description="The Ustad-approved text to send to the parents.")

class MessageResponse(BaseModel):
    id: Union[UUID, str]
    thread_id: Union[UUID, str]
    sender_id: Union[UUID, str]
    message: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AcademicMessageResponseData(BaseModel):
    message_id: str
    thread_id: str
    sender_id: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AcademicMessageResponseWrapper(BaseModel):
    status: str = "success"
    data: AcademicMessageResponseData

# Legacy / Direct Progress Message Compatibility
class ProgressMessageCreate(BaseModel):
    student_id: str
    message: str

class ProgressReplyCreate(BaseModel):
    reply_text: str

# --- Flow 4: Super Admin Escalations ---
class EscalationCreate(BaseModel):
    subject: str = Field(..., max_length=255)
    complaint_details: str = Field(..., min_length=20, description="Detailed explanation of the issue.")

class EscalationResponse(BaseModel):
    id: Union[UUID, str]
    subject: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EscalationResponseData(BaseModel):
    escalation_id: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EscalationResponseWrapper(BaseModel):
    status: str = "success"
    message: str = "Your grievance has been securely forwarded directly to Super Admin Headquarters. A representative will contact you."
    data: EscalationResponseData

# --- Public Inquiries ---
class InquiryCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    center_id: Optional[str] = None

class InquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    message: str
    routed_to: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
