from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.auth import Center, User, ParentStudentLink, CenterStatus, UserRole
from app.schemas.auth import CenterCreate, UserRegister, UserLogin
from app.core.security import hash_password, verify_password, create_access_token

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

def update_center_status(db: Session, center_id: int, status_val: str) -> Center:
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
            detail=f"Center with id {center_id} not found"
        )
    center.status = status_upper
    db.commit()
    db.refresh(center)
    return center

def get_center_details(db: Session, center_id: int) -> Center:
    center = db.query(Center).filter(Center.id == center_id).first()
    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Center with id {center_id} not found"
        )
    return center

def register_user(db: Session, payload: UserRegister) -> User:
    role_upper = payload.role.upper()
    if role_upper not in [r.value for r in UserRole]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'"
        )
    
    # Non-SUPER_ADMIN users must belong to a valid center
    if role_upper != UserRole.SUPER_ADMIN.value and payload.center_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{payload.role}' requires a valid center_id"
        )

    if payload.center_id:
        center = db.query(Center).filter(Center.id == payload.center_id).first()
        if not center:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Center with id {payload.center_id} not found"
            )

    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists"
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=role_upper,
        center_id=payload.center_id if role_upper != UserRole.SUPER_ADMIN.value else None,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login(db: Session, payload: UserLogin) -> dict:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is suspended"
        )

    # Check center status if not super admin
    if user.center_id:
        center = db.query(Center).filter(Center.id == user.center_id).first()
        if center and center.status == CenterStatus.SUSPENDED.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your Dars center account is suspended"
            )

    token_data = {
        "user_id": user.id,
        "role": user.role,
        "center_id": user.center_id,
        "email": user.email
    }
    access_token = create_access_token(data=token_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

def link_parent_to_student(db: Session, parent_id: int, student_id: int) -> ParentStudentLink:
    parent = db.query(User).filter(User.id == parent_id, User.role == UserRole.PARENT.value).first()
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parent user with id {parent_id} not found"
        )
    student = db.query(User).filter(User.id == student_id, User.role == UserRole.STUDENT.value).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student user with id {student_id} not found"
        )

    existing = db.query(ParentStudentLink).filter(
        ParentStudentLink.parent_id == parent_id,
        ParentStudentLink.student_id == student_id
    ).first()
    if existing:
        return existing

    link = ParentStudentLink(parent_id=parent_id, student_id=student_id)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link
