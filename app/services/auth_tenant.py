from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime, timezone
from typing import Union, Optional, List

from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.context import current_tenant_id, current_user_id, current_user_role
from app.models.auth import Center, User, StudentProfile, ParentStudentLink, CenterStatus, UserRole
from app.schemas.auth import CenterCreate, UserCreate, UserRegister, UserLogin, LoginRequest, TokenResponse, ParentStudentLinkCreate

def create_center(db: Session, payload: CenterCreate) -> Center:
    existing = db.query(Center).filter(Center.code == payload.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Center with code '{payload.code}' already exists"
        )
    center = Center(
        name=payload.name,
        code=payload.code,
        address=payload.address,
        capacity=payload.capacity or 100,
        status=CenterStatus.ACTIVE.value
    )
    db.add(center)
    db.commit()
    db.refresh(center)
    return center

def update_center_status(db: Session, center_id: str, status_val: str) -> Center:
    status_upper = status_val.upper()
    if status_upper not in [s.value for s in CenterStatus]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_val}'. Allowed values: ACTIVE, SUSPENDED"
        )
    center = db.query(Center).filter(Center.id == center_id).first()
    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Center with id '{center_id}' not found"
        )
    center.status = status_upper
    db.commit()
    db.refresh(center)
    return center

def get_center_details(db: Session, center_id: str) -> Center:
    center = db.query(Center).filter(Center.id == center_id).first()
    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Center with id '{center_id}' not found"
        )
    return center

def register_user(db: Session, payload: Union[UserCreate, UserRegister]) -> User:
    role_str = payload.role.value if isinstance(payload.role, UserRole) else str(payload.role)
    role_upper = role_str.upper()
    
    # 1. Fetch tenant context from middleware, payload, or logged-in user
    tenant_id = current_tenant_id.get() or getattr(payload, "center_id", None)

    if not tenant_id and current_user_id.get():
        curr_user = db.query(User).filter(User.id == current_user_id.get()).first()
        if curr_user and curr_user.center_id:
            tenant_id = curr_user.center_id

    # 2. Fallback: If still no tenant_id and registering a non-SUPER_ADMIN, assign to first available Center
    if not tenant_id and role_upper != UserRole.SUPER_ADMIN.value:
        default_center = db.query(Center).first()
        if default_center:
            tenant_id = default_center.id

    if tenant_id and role_upper != UserRole.SUPER_ADMIN.value:
        center = db.query(Center).filter(Center.id == tenant_id).first()
        if not center:
            default_center = db.query(Center).first()
            if default_center:
                tenant_id = default_center.id

    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists"
        )

    hashed_pwd = get_password_hash(payload.password)
    clean_phone = payload.phone.strip() if (payload.phone and payload.phone.strip()) else None

    user = User(
        email=payload.email,
        hashed_password=hashed_pwd,
        full_name=payload.full_name,
        role=role_upper,
        center_id=tenant_id if role_upper != UserRole.SUPER_ADMIN.value else None,
        phone=clean_phone,
        address=getattr(payload, "address", None),
        emergency_contact=getattr(payload, "emergency_contact", None),
        gov_id_card_url=getattr(payload, "gov_id_card_url", None),
        is_active=True
    )
    
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email or phone number already exists."
        )

    # Automatically create StudentProfile if registering a STUDENT
    if role_upper == UserRole.STUDENT.value:
        profile = StudentProfile(
            user_id=user.id,
            is_zakat_eligible=getattr(payload, "is_zakat_eligible", False) or False,
            address=getattr(payload, "address", None),
            emergency_contact=getattr(payload, "emergency_contact", None),
            enrollment_date=datetime.now(timezone.utc).date()
        )
        db.add(profile)
        db.commit()
        db.refresh(user)

    try:
        from app.services.performance import run_full_monthly_performance_aggregation
        run_full_monthly_performance_aggregation(db)
    except Exception as e:
        print(f"Auto aggregation warning: {e}")

    return user

# DDD Application Service alias
register_user_service = register_user

def login(db: Session, payload: Union[UserLogin, LoginRequest]) -> dict:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been suspended."
        )

    if user.center_id:
        center = db.query(Center).filter(Center.id == user.center_id).first()
        if center and center.status == CenterStatus.SUSPENDED.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your Dars center account is suspended"
            )

    token_data = {
        "sub": user.email,
        "user_id": str(user.id),
        "role": user.role,
        "center_id": str(user.center_id) if user.center_id else None,
        "email": user.email
    }
    access_token = create_access_token(data=token_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "center_id": user.center_id,
        "user": user
    }

# DDD Application Service alias
login_user_service = login

def link_parent_to_student(db: Session, parent_id: str, student_id: str, relation_type: str = "GUARDIAN") -> ParentStudentLink:
    parent = db.query(User).filter(User.id == parent_id, User.role == UserRole.PARENT.value).first()
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parent user with id '{parent_id}' not found"
        )
    student = db.query(User).filter(User.id == student_id, User.role == UserRole.STUDENT.value).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student user with id '{student_id}' not found"
        )

    existing = db.query(ParentStudentLink).filter(
        ParentStudentLink.parent_id == parent_id,
        ParentStudentLink.student_id == student_id
    ).first()
    if existing:
        return existing

    link = ParentStudentLink(
        parent_id=parent_id,
        student_id=student_id,
        relation_type=relation_type or "GUARDIAN"
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def get_all_centers(db: Session) -> list[Center]:
    return db.query(Center).order_by(Center.created_at.desc()).all()

def get_users_by_role(db: Session, role_val: str, center_id: Optional[str] = None) -> list[User]:
    query = db.query(User).filter(User.role == role_val.upper())
    if center_id:
        query = query.filter(User.center_id == center_id)
    return query.all()

def get_user_by_id(db: Session, user_id: str) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id '{user_id}' not found")
    return user

def update_user_status(db: Session, user_id: str, is_active: bool) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id '{user_id}' not found")
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user

def dismiss_user(db: Session, user_id: str) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id '{user_id}' not found")
    user.is_active = False
    db.commit()
    return {"status": "success", "message": f"User '{user.full_name}' has been dismissed/deactivated."}
