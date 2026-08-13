from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base, TenantBase, generate_uuid_str
from app.models.enums import UserRole, CenterStatus, RelationType

# ---------------------------------------------------------
# 1. Centers (Tenants) Model
# ---------------------------------------------------------
class Center(Base):
    __tablename__ = "centers"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    address = Column(Text, nullable=True)
    capacity = Column(Integer, default=100)
    status = Column(String(50), default=CenterStatus.ACTIVE.value)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="center", cascade="all, delete-orphan")


# ---------------------------------------------------------
# 2. Users Model
# ---------------------------------------------------------
class User(TenantBase):
    __tablename__ = "users"

    # OVERRIDE: Super Admins exist outside of a specific center, so center_id is nullable here.
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=True, index=True)
    
    role = Column(String(50), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    address = Column(String(500), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    gov_id_card_url = Column(String(500), nullable=True)
    kiosk_pin = Column(String(10), default="1234", nullable=True)
    student_card_id = Column(String(50), nullable=True, index=True)

    # Relationships
    center = relationship("Center", back_populates="users")
    student_profile = relationship(
        "StudentProfile",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="[StudentProfile.user_id]"
    )


# ---------------------------------------------------------
# 3. Student Profile Model (Polymorphic Extension)
# ---------------------------------------------------------
class StudentProfile(Base):
    __tablename__ = "student_profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    is_zakat_eligible = Column(Boolean, default=False)
    address = Column(String(500), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    enrollment_date = Column(Date, nullable=False, server_default=func.current_date())
    sponsor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="student_profile")
    sponsor = relationship("User", foreign_keys=[sponsor_id])


# ---------------------------------------------------------
# 4. Parent-Student Relationship (Junction Table)
# ---------------------------------------------------------
class ParentStudentRelation(Base):
    __tablename__ = "parent_student_relations"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    parent_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    relation_type = Column(String(50), default=RelationType.GUARDIAN.value)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id])
    student = relationship("User", foreign_keys=[student_id])

# Backward compatibility alias
ParentStudentLink = ParentStudentRelation
