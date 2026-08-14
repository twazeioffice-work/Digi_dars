from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date, time
from app.models.kitchen import MealType, NotificationStatus

class CookCreate(BaseModel):
    center_id: str
    name: str
    phone_number: str
    is_active: bool = True

class CookResponse(BaseModel):
    id: str
    center_id: str
    name: str
    phone_number: str
    is_active: bool
    created_at: Optional[str] = None

class MealScheduleUpdate(BaseModel):
    meal_type: MealType
    serving_time: str  # e.g. "08:00:00"
    offset_hours: int = Field(default=4, ge=1, le=12)

class MealScheduleResponse(BaseModel):
    id: Optional[str] = None
    meal_type: MealType
    serving_time: str
    offset_hours: int

class HeadcountPreviewResponse(BaseModel):
    target_date: str
    metrics: Dict[str, Any]
    formatted_message: str

class CookNotificationLogResponse(BaseModel):
    id: str
    meal_type: MealType
    target_date: str
    expected_students: int
    expected_staff: int
    leaves_tomorrow: int
    afternoon_returns: int
    status: NotificationStatus
    formatted_message: Optional[str] = None
    sent_at: Optional[str] = None
