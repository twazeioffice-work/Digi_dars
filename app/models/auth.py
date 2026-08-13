from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
import enum
import uuid
from app.database import Base

def generate_uuid_str():
    return str(uuid.uuid4())

class CenterStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    CENTER_ADMIN = "CENTER_ADMIN"
    NAZIM = "NAZIM"
    USTAD = "USTAD"
    PARENT = "PARENT"
    STUDENT = "STUDENT"

class Center(Base):
    __tablename__ = "centers"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    address = Column(String(500), nullable=True)
    capacity = Column(Integer, default=100)
    status = Column(String(50), default=CenterStatus.ACTIVE.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="center", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=True)
    role = Column(String(50), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    center = relationship("Center", back_populates="users")
    student_profile = relationship("StudentProfile", uselist=False, back_populates="user", cascade="all, delete-orphan", foreign_keys="[StudentProfile.user_id]")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    is_zakat_eligible = Column(Boolean, default=False)
    enrollment_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    sponsor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id], back_populates="student_profile")
    sponsor = relationship("User", foreign_keys=[sponsor_id])

class ParentStudentLink(Base):
    __tablename__ = "parent_student_relations"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    parent_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    relation_type = Column(String(50), default="GUARDIAN")  # FATHER, MOTHER, GUARDIAN
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
