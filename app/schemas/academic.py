from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class HalqaCreate(BaseModel):
    name: str
    department: str  # Hifz, Kitab, Tajweed
    center_id: Optional[str] = None
    ustad_id: Optional[str] = None

class HalqaResponse(BaseModel):
    id: str
    name: str
    department: str
    center_id: str
    ustad_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HalqaEnrollmentCreate(BaseModel):
    student_id: str
    halqa_id: str

class HalqaEnrollmentResponse(BaseModel):
    id: str
    halqa_id: str
    student_id: str
    enrolled_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HifzProgressCreate(BaseModel):
    student_id: str
    log_date: Optional[date] = None
    sabaq: str
    sabqi: Optional[str] = None
    manzil: Optional[str] = None
    remarks: Optional[str] = None

class HifzProgressResponse(BaseModel):
    id: str
    student_id: str
    ustad_id: Optional[str] = None
    log_date: date
    sabaq: str
    sabqi: Optional[str] = None
    manzil: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class KitabProgressCreate(BaseModel):
    student_id: str
    log_date: Optional[date] = None
    book_name: str
    chapter_completed: str
    pages_read: Optional[int] = 0
    remarks: Optional[str] = None

class KitabProgressResponse(BaseModel):
    id: str
    student_id: str
    ustad_id: Optional[str] = None
    log_date: date
    book_name: str
    chapter_completed: str
    pages_read: int
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DailyTarbiyyahCreate(BaseModel):
    student_id: str
    log_date: Optional[date] = None
    fajr: Optional[str] = "PRESENT_JAMAAT"
    dhuhr: Optional[str] = "PRESENT_JAMAAT"
    asr: Optional[str] = "PRESENT_JAMAAT"
    maghrib: Optional[str] = "PRESENT_JAMAAT"
    isha: Optional[str] = "PRESENT_JAMAAT"
    behavioral_remarks: Optional[str] = None

class DailyTarbiyyahResponse(BaseModel):
    id: str
    student_id: str
    ustad_id: Optional[str] = None
    log_date: date
    fajr: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    behavioral_remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeaveRequestCreate(BaseModel):
    student_id: str
    start_date: date
    end_date: date
    reason: str
    center_id: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: str
    student_id: str
    center_id: str
    start_date: date
    end_date: date
    reason: str
    status: str
    reviewed_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeaveApprovalUpdate(BaseModel):
    status: str  # APPROVED or REJECTED
