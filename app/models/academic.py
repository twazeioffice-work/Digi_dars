from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
import enum
import uuid
from app.database import Base

def generate_uuid_str():
    return str(uuid.uuid4())

class DepartmentType(str, enum.Enum):
    HIFZ = "HIFZ"
    AALIM_COURSE = "AALIM_COURSE"
    NAZIRA = "NAZIRA"
    MAKTAB = "MAKTAB"

class MasteryLevel(str, enum.Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    NEEDS_WORK = "NEEDS_WORK"
    FAIL = "FAIL"

class JamaatStatus(str, enum.Enum):
    PRESENT_IN_JAMAAT = "PRESENT_IN_JAMAAT"
    LATE = "LATE"
    PRAYED_ALONE = "PRAYED_ALONE"
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
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(255), nullable=False)
    department = Column(String(50), nullable=False)  # HIFZ, AALIM_COURSE, NAZIRA, MAKTAB
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    enrollments = relationship("HalqaEnrollment", back_populates="halqa", cascade="all, delete-orphan")
    ustad = relationship("User", foreign_keys=[ustad_id])

class HalqaEnrollment(Base):
    __tablename__ = "halqa_enrollments"

    halqa_id = Column(String(36), ForeignKey("halqas.id", ondelete="CASCADE"), primary_key=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    enrollment_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, TRANSFERRED, COMPLETED

    halqa = relationship("Halqa", back_populates="enrollments")
    student = relationship("User", foreign_keys=[student_id])

class HifzLog(Base):
    __tablename__ = "hifz_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    
    sabaq_details = Column(String(255), nullable=True)
    sabaq_grade = Column(String(50), nullable=True)  # MasteryLevel
    
    sabqi_details = Column(String(255), nullable=True)
    sabqi_grade = Column(String(50), nullable=True)
    
    manzil_details = Column(String(255), nullable=True)
    manzil_grade = Column(String(50), nullable=True)
    
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("student_id", "log_date", name="uq_hifz_student_date"),
    )

    student = relationship("User", foreign_keys=[student_id])
    ustad = relationship("User", foreign_keys=[ustad_id])

class KitabLog(Base):
    __tablename__ = "kitab_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    
    kitab_name = Column(String(255), nullable=False)
    chapter_or_topic = Column(String(255), nullable=True)
    mutalaa_completed = Column(Boolean, default=False)
    comprehension_grade = Column(String(50), nullable=True)  # MasteryLevel
    
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])
    ustad = relationship("User", foreign_keys=[ustad_id])

class TarbiyyahLog(Base):
    __tablename__ = "tarbiyyah_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    is_on_leave = Column(Boolean, default=False)
    
    fajr = Column(String(50), nullable=True)
    zuhr = Column(String(50), nullable=True)
    asr = Column(String(50), nullable=True)
    maghrib = Column(String(50), nullable=True)
    isha = Column(String(50), nullable=True)
    
    adab_score = Column(Integer, nullable=True)  # 1 to 5
    behavior_remarks = Column(Text, nullable=True)
    recorded_by = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("student_id", "log_date", name="uq_tarbiyyah_student_date"),
        CheckConstraint("adab_score >= 1 AND adab_score <= 5", name="chk_adab_score_range"),
    )

    student = relationship("User", foreign_keys=[student_id])
    recorder = relationship("User", foreign_keys=[recorded_by])

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
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])

class StudentStar(Base):
    __tablename__ = "student_stars"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    issuing_ustad_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # e.g., Tajweed Fluency, Namaz Discipline, Hifz Mastery
    explanation = Column(Text, nullable=False)
    awarded_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])
    ustad = relationship("User", foreign_keys=[issuing_ustad_id])
    center = relationship("Center")

class StudentWarning(Base):
    __tablename__ = "student_warnings"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    issuing_ustad_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(String(50), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH
    category = Column(String(100), nullable=False)  # Misconduct, Tardiness, Academic Negligence
    reasoning = Column(Text, nullable=False)
    issued_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])
    ustad = relationship("User", foreign_keys=[issuing_ustad_id])
    center = relationship("Center")
