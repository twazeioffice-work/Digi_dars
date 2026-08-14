from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, Union
from datetime import datetime, date
from uuid import UUID
from app.models.enums import UserRole

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
    address: Optional[str] = None
    capacity: int
    status: str
    created_at: datetime
    nazim_count: Optional[int] = 0
    ustad_count: Optional[int] = 0
    student_count: Optional[int] = 0
    has_cook: Optional[bool] = False
    cook_name: Optional[str] = None
    cook_phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StudentProfileCreate(BaseModel):
    is_zakat_eligible: Optional[bool] = False
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    gov_id_card_url: Optional[str] = None
    enrollment_date: Optional[date] = None
    sponsor_id: Optional[str] = None

class StudentProfileResponse(BaseModel):
    user_id: str
    is_zakat_eligible: bool
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    gov_id_card_url: Optional[str] = None
    enrollment_date: date
    sponsor_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: Union[UserRole, str]
    center_id: Optional[str] = None
    is_zakat_eligible: Optional[bool] = False
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    gov_id_card_url: Optional[str] = None

# Backward compatibility alias
UserRegister = UserCreate

class UserUpdateStatus(BaseModel):
    is_active: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# DDD Alias
LoginRequest = UserLogin

class UserResponse(BaseModel):
    id: Union[UUID, str]
    email: str
    full_name: str
    role: Union[UserRole, str]
    center_id: Optional[Union[UUID, str]] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    gov_id_card_url: Optional[str] = None
    is_active: bool
    student_profile: Optional[StudentProfileResponse] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[Union[UserRole, str]] = None
    center_id: Optional[Union[UUID, str]] = None
    user: Optional[UserResponse] = None

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
