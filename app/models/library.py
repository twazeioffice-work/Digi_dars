from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base, generate_uuid_str

class CenterLibraryConfig(Base):
    """
    Controls whether the digital library feature is accessible to general roles
    (students and usthads) within a specific center.
    By default, only the Super Admin / Alim can view/verify library content.
    """
    __tablename__ = "center_library_configs"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    # Toggle switches
    is_enabled_for_all = Column(Boolean, default=False)  # False = Only Super Admin (Alim verification phase)
    is_hadith_api_active = Column(Boolean, default=True)
    
    last_updated_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
