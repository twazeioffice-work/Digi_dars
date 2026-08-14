from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from uuid import UUID
from app.models.enums import MasteryLevel, JamaatStatus

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
    student_id: Union[UUID, str]
    log_date: date = Field(default_factory=date.today)
    sabaq_details: Optional[str] = None
    sabaq_grade: Optional[Union[MasteryLevel, str]] = None
    sabqi_details: Optional[str] = None
    sabqi_grade: Optional[Union[MasteryLevel, str]] = None
    manzil_details: Optional[str] = None
    manzil_grade: Optional[Union[MasteryLevel, str]] = None
    remarks: Optional[str] = Field(None, description="Behavioral or academic notes for AI ingestion")

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

class TarbiyyahLogCreate(BaseModel):
    student_id: Union[UUID, str]
    log_date: date = Field(default_factory=date.today)
    is_on_leave: bool = False
    fajr: Optional[Union[JamaatStatus, str]] = None
    zuhr: Optional[Union[JamaatStatus, str]] = None
    asr: Optional[Union[JamaatStatus, str]] = None
    maghrib: Optional[Union[JamaatStatus, str]] = None
    isha: Optional[Union[JamaatStatus, str]] = None
    adab_score: int = Field(5, ge=1, le=5, description="Score from 1 (Poor) to 5 (Excellent)")
    behavior_remarks: Optional[str] = None

class SingleTarbiyyahEntry(TarbiyyahLogCreate):
    pass

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
    status: Optional[str] = "PENDING"
    is_emergency: Optional[bool] = False
    is_kiosk: Optional[bool] = False

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

class AttendanceTrend(BaseModel):
    date: str
    percent: float

class HalqaStat(BaseModel):
    id: Union[UUID, str]
    name: str
    ustad_name: str
    student_count: int
    avg_attendance: float
    sabaq_completion_rate: float

class NazimDashboardResponse(BaseModel):
    center_name: str
    total_students: int
    zakat_eligible_count: int
    active_halqas: int
    overall_attendance: float
    attendance_trend: List[AttendanceTrend]
    halqas: List[HalqaStat]
