from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import enum
import uuid
from app.database import Base

def generate_uuid_str():
    return str(uuid.uuid4())

class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class InternalTicket(Base):
    __tablename__ = "internal_tickets"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default=TicketStatus.OPEN.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    ustad = relationship("User", foreign_keys=[ustad_id])

class BroadcastNotice(Base):
    __tablename__ = "broadcast_notices"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    audience = Column(String(100), nullable=False)  # "All Parents", "Hifz Batch Parents"
    message = Column(Text, nullable=False)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sender = relationship("User", foreign_keys=[created_by])

class ProgressMessage(Base):
    __tablename__ = "progress_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    replies = relationship("ProgressMessageReply", back_populates="parent_message", cascade="all, delete-orphan")

class ProgressMessageReply(Base):
    __tablename__ = "progress_message_replies"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    message_id = Column(String(36), ForeignKey("progress_messages.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reply_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    parent_message = relationship("ProgressMessage", back_populates="replies")

class SuperAdminEscalation(Base):
    __tablename__ = "super_admin_escalations"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="SET NULL"), nullable=True)  # Bypasses RLS!
    subject = Column(String(255), nullable=False)
    grievance_description = Column(Text, nullable=False)
    priority = Column(String(50), default="URGENT")
    status = Column(String(50), default=TicketStatus.OPEN.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])

class PublicInquiry(Base):
    __tablename__ = "public_inquiries"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    message = Column(Text, nullable=False)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="SET NULL"), nullable=True)  # Null routes to Super Admin
    routed_to = Column(String(50), nullable=False)  # "LOCAL_NAZIM" or "SUPER_ADMIN"
    status = Column(String(50), default=TicketStatus.OPEN.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
