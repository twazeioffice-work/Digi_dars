from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
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

class BroadcastAudience(str, enum.Enum):
    ALL_PARENTS = "ALL_PARENTS"
    HIFZ_PARENTS = "HIFZ_PARENTS"
    AALIM_PARENTS = "AALIM_PARENTS"
    SPECIFIC_HALQA = "SPECIFIC_HALQA"

class InternalTicket(Base):
    __tablename__ = "internal_tickets"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)  # e.g., MAINTENANCE, ACADEMIC_SUPPLIES, LEAVE_REQUEST
    status = Column(String(50), default=TicketStatus.OPEN.value)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[created_by])
    assignee = relationship("User", foreign_keys=[assigned_to])

class Broadcast(Base):
    __tablename__ = "broadcasts"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    sent_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    audience = Column(String(50), nullable=False)  # BroadcastAudience
    target_halqa_id = Column(String(36), ForeignKey("halqas.id", ondelete="CASCADE"), nullable=True)
    
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sender = relationship("User", foreign_keys=[sent_by])

class AcademicThread(Base):
    __tablename__ = "academic_threads"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("ustad_id", "student_id", name="uq_ustad_student_thread"),
    )

    ustad = relationship("User", foreign_keys=[ustad_id])
    student = relationship("User", foreign_keys=[student_id])
    messages = relationship("AcademicMessage", back_populates="thread", cascade="all, delete-orphan")

class AcademicMessage(Base):
    __tablename__ = "academic_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    thread_id = Column(String(36), ForeignKey("academic_threads.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    thread = relationship("AcademicThread", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])

class SuperAdminEscalation(Base):
    __tablename__ = "super_admin_escalations"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    submitted_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    subject = Column(String(255), nullable=False)
    complaint_details = Column(Text, nullable=False)
    status = Column(String(50), default=TicketStatus.OPEN.value)
    
    super_admin_notes = Column(Text, nullable=True)
    resolved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    submitter = relationship("User", foreign_keys=[submitted_by])
    resolver = relationship("User", foreign_keys=[resolved_by])

class PublicInquiry(Base):
    __tablename__ = "public_inquiries"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    routed_to = Column(String(50), nullable=False)  # LOCAL_NAZIM or SUPER_ADMIN
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=True)
    sender_phone = Column(String(50), nullable=False)
    recipient_phone = Column(String(50), nullable=False)
    direction = Column(String(20), nullable=False)  # INBOUND or OUTBOUND
    message_text = Column(Text, nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_complaint = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])
    ustad = relationship("User", foreign_keys=[ustad_id])
