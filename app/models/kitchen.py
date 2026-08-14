from datetime import datetime, date, time
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Time, Date, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base, generate_uuid_str

class MealType(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class CookProfile(Base):
    """
    Stores registered cooks for each center to dispatch meal headcounts.
    """
    __tablename__ = "cook_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MealSchedule(Base):
    """
    Defines feeding schedules and notification timing targets per Center.
    """
    __tablename__ = "meal_schedules"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_type = Column(SQLEnum(MealType), nullable=False)
    serving_time = Column(Time, nullable=False)
    offset_hours = Column(Integer, default=4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CookNotificationLog(Base):
    """
    Tracks sent WhatsApp notification logs, payload metrics, and status.
    """
    __tablename__ = "cook_notification_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), nullable=False, index=True)
    cook_id = Column(String(36), ForeignKey("cook_profiles.id", ondelete="CASCADE"), nullable=False)
    meal_type = Column(SQLEnum(MealType), nullable=False)
    target_date = Column(Date, nullable=False, index=True)
    
    expected_students = Column(Integer, nullable=False, default=0)
    expected_staff = Column(Integer, nullable=False, default=0)
    leaves_tomorrow = Column(Integer, nullable=False, default=0)
    afternoon_returns = Column(Integer, nullable=False, default=0)
    
    formatted_message = Column(Text, nullable=False)
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING)
    sent_at = Column(DateTime(timezone=True), nullable=True)
