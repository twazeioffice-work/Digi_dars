from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.auth import (
    CenterCreate, CenterUpdateStatus, CenterResponse,
    UserRegister, UserLogin, TokenResponse, UserResponse,
    ParentStudentLinkCreate, ParentStudentLinkResponse
)
from app.services import auth_tenant
from app.core.guards import role_guard

router = APIRouter(prefix="/v1", tags=["Module 1: Auth & Multi-Tenancy"])

# Tenant (Center) Management
@router.post(
    "/centers",
    response_model=CenterResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
)
def create_center_endpoint(payload: CenterCreate, db: Session = Depends(get_db)):
    """(Super Admin Only) Create a new Dars center."""
    return auth_tenant.create_center(db, payload)

@router.patch(
    "/centers/{center_id}/status",
    response_model=CenterResponse,
    dependencies=[Depends(role_guard(["SUPER_ADMIN"]))]
)
def update_center_status_endpoint(
    center_id: int,
    payload: CenterUpdateStatus,
    db: Session = Depends(get_db)
):
    """(Super Admin Only) Activate or suspend a Dars center."""
    return auth_tenant.update_center_status(db, center_id, payload.status)

@router.get("/centers/{center_id}", response_model=CenterResponse)
def get_center_details_endpoint(center_id: int, db: Session = Depends(get_db)):
    """Retrieve details and metadata for a specific center."""
    return auth_tenant.get_center_details(db, center_id)

# User & Role Management
@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user_endpoint(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user (Ustad, Nazim, Parent, Student, etc.)."""
    return auth_tenant.register_user(db, payload)

@router.post("/auth/login", response_model=TokenResponse)
def login_endpoint(payload: UserLogin, db: Session = Depends(get_db)):
    """Log in with email and password to receive a JWT access token."""
    return auth_tenant.login(payload=payload, db=db)

@router.post(
    "/parents/link-student",
    response_model=ParentStudentLinkResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_guard(["SUPER_ADMIN", "CENTER_ADMIN", "NAZIM"]))]
)
def link_parent_to_student_endpoint(
    payload: ParentStudentLinkCreate,
    db: Session = Depends(get_db)
):
    """Link a Parent user to a Student user."""
    return auth_tenant.link_parent_to_student(db, payload.parent_id, payload.student_id)
