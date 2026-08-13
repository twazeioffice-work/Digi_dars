from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, date

class CenterCreate(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    capacity: Optional[int] = 100

class CenterUpdateStatus(BaseModel):
    status: str  # ACTIVE or SUSPENDED

class CenterResponse(BaseModel):
    id: str
    name: str
    code: str
    address: Optional[str]
    capacity: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentProfileCreate(BaseModel):
    is_zakat_eligible: Optional[bool] = False
    enrollment_date: Optional[date] = None
    sponsor_id: Optional[str] = None

class StudentProfileResponse(BaseModel):
    user_id: str
    is_zakat_eligible: bool
    enrollment_date: date
    sponsor_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # SUPER_ADMIN, CENTER_ADMIN, NAZIM, USTAD, PARENT, STUDENT
    center_id: Optional[str] = None
    phone: Optional[str] = None
    is_zakat_eligible: Optional[bool] = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    center_id: Optional[str]
    phone: Optional[str] = None
    is_active: bool
    student_profile: Optional[StudentProfileResponse] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ParentStudentLinkCreate(BaseModel):
    parent_id: str
    student_id: str
    relation_type: Optional[str] = "GUARDIAN"

class ParentStudentLinkResponse(BaseModel):
    id: str
    parent_id: str
    student_id: str
    relation_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
