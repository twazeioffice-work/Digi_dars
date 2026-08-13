from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base, generate_uuid_str

class ComplaintStatus(str, enum.Enum):
    PENDING_SUPER_ADMIN = "pending_super_admin"  # Only Super Admin can see initially
    ASSIGNED_TO_NAZIM = "assigned_to_nazim"      # Routed to the local Nazim
    RESOLVED_BY_SUPER_ADMIN = "resolved_by_super_admin"
    RESOLVED_BY_NAZIM = "resolved_by_nazim"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    category = Column(String(100), nullable=False)  # "Food", "Hygiene", "Usthad", "Nazim", "Facility", "Other"
    description = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False)

    status = Column(String(50), default=ComplaintStatus.PENDING_SUPER_ADMIN.value, nullable=False, index=True)

    # Track routing & resolution
    assigned_to_nazim_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    super_admin_notes = Column(Text, nullable=True)
    nazim_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    center = relationship("Center")
    student = relationship("User", foreign_keys=[student_id])
    assigned_nazim = relationship("User", foreign_keys=[assigned_to_nazim_id])
