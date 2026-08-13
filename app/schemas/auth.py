from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class CenterCreate(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    capacity: Optional[int] = 100

class CenterUpdateStatus(BaseModel):
    status: str  # ACTIVE or SUSPENDED

class CenterResponse(BaseModel):
    id: int
    name: str
    code: str
    address: Optional[str]
    capacity: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # SUPER_ADMIN, CENTER_ADMIN, NAZIM, USTAD, PARENT, STUDENT
    center_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    center_id: Optional[int]
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ParentStudentLinkCreate(BaseModel):
    parent_id: int
    student_id: int

class ParentStudentLinkResponse(BaseModel):
    id: int
    parent_id: int
    student_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
