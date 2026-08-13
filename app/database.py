import uuid
from sqlalchemy import create_engine, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def generate_uuid_str():
    return str(uuid.uuid4())

class TenantBase(Base):
    """
    Abstract base class for all tenant-specific models (Finance, Academic, etc.).
    Automatically adds an ID, a strictly required center_id, and timestamps.
    """
    __abstract__ = True

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    center_id = Column(String(36), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
