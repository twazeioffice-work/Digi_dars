from datetime import date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base, generate_uuid_str

# 1. NAZIM DUTIES MODEL
class NazimDuty(Base):
    __tablename__ = "nazim_duties"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    due_date = Column(Date, nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    center = relationship("Center")

# 2. STUDENT PROGRESS CARDS (AGGREGATED HISTORICAL SCORES)
class StudentProgressCard(Base):
    __tablename__ = "student_progress_cards"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    log_month = Column(Date, nullable=False, index=True)  # First day of the tracked month

    # Aggregated category scores (0 - 100)
    namaz_score = Column(Float, default=100.0)
    hygiene_score = Column(Float, default=100.0)
    study_score = Column(Float, default=100.0)
    chores_score = Column(Float, default=100.0)
    overall_score = Column(Float, default=100.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    center = relationship("Center")

# 3. STAFF PROGRESS CARDS (USTAD & NAZIM MONTHLY RATINGS)
class StaffProgressCard(Base):
    """Tracks Usthad and Nazim monthly ratings."""
    __tablename__ = "staff_progress_cards"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # "USTAD" or "NAZIM"
    log_month = Column(Date, nullable=False, index=True)

    performance_score = Column(Float, default=100.0)
    penalty_points = Column(Float, default=0.0)
    final_rating = Column(Float, default=100.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    center = relationship("Center")

# 4. INSTITUTION PERFORMANCE & RANKING
class InstitutionPerformance(Base):
    __tablename__ = "institution_performance"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    log_month = Column(Date, nullable=False, index=True)

    avg_student_score = Column(Float, default=0.0)
    avg_usthad_score = Column(Float, default=0.0)
    nazim_duty_score = Column(Float, default=0.0)

    total_institution_score = Column(Float, default=0.0)
    global_rank = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    center = relationship("Center")

    __table_args__ = (
        Index("ix_institution_perf_month_score", "log_month", "total_institution_score"),
    )
