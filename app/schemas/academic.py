from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class HalqaCreate(BaseModel):
    name: str
    department: str  # HIFZ, AALIM_COURSE, NAZIRA, MAKTAB
    center_id: Optional[str] = None
    ustad_id: Optional[str] = None

class HalqaResponse(BaseModel):
    id: str
    center_id: str
    ustad_id: str
    name: str
    department: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HalqaEnrollmentCreate(BaseModel):
    student_id: str
    halqa_id: str
    status: Optional[str] = "ACTIVE"

class HalqaEnrollmentResponse(BaseModel):
    halqa_id: str
    student_id: str
    enrollment_date: date
    status: str

    model_config = ConfigDict(from_attributes=True)

class HifzLogCreate(BaseModel):
    student_id: str
    log_date: Optional[date] = None
    sabaq_details: Optional[str] = None
    sabaq_grade: Optional[str] = "EXCELLENT"  # EXCELLENT, GOOD, NEEDS_WORK, FAIL
    sabqi_details: Optional[str] = None
    sabqi_grade: Optional[str] = "GOOD"
    manzil_details: Optional[str] = None
    manzil_grade: Optional[str] = "GOOD"
    remarks: Optional[str] = None

class HifzLogResponse(BaseModel):
    id: str
    center_id: str
    student_id: str
    ustad_id: str
    log_date: date
    sabaq_details: Optional[str] = None
    sabaq_grade: Optional[str] = None
    sabqi_details: Optional[str] = None
    sabqi_grade: Optional[str] = None
    manzil_details: Optional[str] = None
    manzil_grade: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class KitabLogCreate(BaseModel):
    student_id: str
    log_date: Optional[date] = None
    kitab_name: str
    chapter_or_topic: Optional[str] = None
    mutalaa_completed: Optional[bool] = False
    comprehension_grade: Optional[str] = "GOOD"
    remarks: Optional[str] = None

class KitabLogResponse(BaseModel):
    id: str
    center_id: str
    student_id: str
    ustad_id: str
    log_date: date
    kitab_name: str
    chapter_or_topic: Optional[str] = None
    mutalaa_completed: bool
    comprehension_grade: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SingleTarbiyyahEntry(BaseModel):
    student_id: str
    log_date: Optional[date] = None
    is_on_leave: Optional[bool] = False
    fajr: Optional[str] = "PRESENT_IN_JAMAAT"  # PRESENT_IN_JAMAAT, LATE, PRAYED_ALONE, MISSED, EXCUSED
    zuhr: Optional[str] = "PRESENT_IN_JAMAAT"
    asr: Optional[str] = "PRESENT_IN_JAMAAT"
    maghrib: Optional[str] = "PRESENT_IN_JAMAAT"
    isha: Optional[str] = "PRESENT_IN_JAMAAT"
    adab_score: Optional[int] = Field(5, ge=1, le=5)
    behavior_remarks: Optional[str] = None

class BulkTarbiyyahCreate(BaseModel):
    entries: List[SingleTarbiyyahEntry]

class TarbiyyahLogResponse(BaseModel):
    id: str
    center_id: str
    student_id: str
    log_date: date
    is_on_leave: bool
    fajr: Optional[str] = None
    zuhr: Optional[str] = None
    asr: Optional[str] = None
    maghrib: Optional[str] = None
    isha: Optional[str] = None
    adab_score: Optional[int] = None
    behavior_remarks: Optional[str] = None
    recorded_by: str
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
