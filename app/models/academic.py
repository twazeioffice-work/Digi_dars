from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
import enum
import uuid
from app.database import Base

def generate_uuid_str():
    return str(uuid.uuid4())

class PrayerStatus(str, enum.Enum):
    PRESENT_JAMAAT = "PRESENT_JAMAAT"
    PRESENT_INDIVIDUAL = "PRESENT_INDIVIDUAL"
    MISSED = "MISSED"
    EXCUSED = "EXCUSED"

class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Halqa(Base):
    __tablename__ = "halqas"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)  # Hifz, Kitab, Tajweed
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    enrollments = relationship("HalqaEnrollment", back_populates="halqa", cascade="all, delete-orphan")
    ustad = relationship("User", foreign_keys=[ustad_id])

class HalqaEnrollment(Base):
    __tablename__ = "halqa_enrollments"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    halqa_id = Column(String(36), ForeignKey("halqas.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    halqa = relationship("Halqa", back_populates="enrollments")
    student = relationship("User", foreign_keys=[student_id])

class HifzProgress(Base):
    __tablename__ = "hifz_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    sabaq = Column(String(255), nullable=False)   # New lesson (e.g. Surah Al-Mulk v.1-10)
    sabqi = Column(String(255), nullable=True)    # Recent revision
    manzil = Column(String(255), nullable=True)   # Past revision
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])

class KitabProgress(Base):
    __tablename__ = "kitab_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    book_name = Column(String(255), nullable=False)
    chapter_completed = Column(String(255), nullable=False)
    pages_read = Column(Integer, default=0)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])

class DailyTarbiyyah(Base):
    __tablename__ = "daily_tarbiyyah"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    fajr = Column(String(50), default=PrayerStatus.PRESENT_JAMAAT.value)
    dhuhr = Column(String(50), default=PrayerStatus.PRESENT_JAMAAT.value)
    asr = Column(String(50), default=PrayerStatus.PRESENT_JAMAAT.value)
    maghrib = Column(String(50), default=PrayerStatus.PRESENT_JAMAAT.value)
    isha = Column(String(50), default=PrayerStatus.PRESENT_JAMAAT.value)
    behavioral_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default=LeaveStatus.PENDING.value)
    reviewed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])
