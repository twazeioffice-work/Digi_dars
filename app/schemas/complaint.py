from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class KioskLoginRequest(BaseModel):
    student_identifier: str  # Email, Phone, Student Card ID, or Student Name
    pin: str = "1234"

class ComplaintCreate(BaseModel):
    category: str  # "Food", "Hygiene", "Usthad", "Nazim", "Facility", "Other"
    description: str
    is_anonymous: bool = False

class ComplaintRouteRequest(BaseModel):
    assigned_to_nazim_id: Optional[str] = None
    super_admin_notes: Optional[str] = None

class ComplaintResolveSuperAdmin(BaseModel):
    super_admin_notes: str

class ComplaintResolveNazim(BaseModel):
    nazim_notes: str

class ComplaintResponse(BaseModel):
    id: str
    center_id: str
    center_name: Optional[str] = None
    student_id: str
    student_name: Optional[str] = None
    category: str
    description: str
    is_anonymous: bool
    status: str
    assigned_to_nazim_id: Optional[str] = None
    assigned_nazim_name: Optional[str] = None
    super_admin_notes: Optional[str] = None
    nazim_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
