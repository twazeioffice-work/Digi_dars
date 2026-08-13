from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

def generate_uuid_str():
    return str(uuid.uuid4())

class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=True)
    document_name = Column(String(255), nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True)
    meta_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class StudentRemarkVector(Base):
    __tablename__ = "student_remark_vectors"

    id = Column(String(36), primary_key=True, default=generate_uuid_str, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    center_id = Column(String(36), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    ustad_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    chunk_text = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True)
    week_number = Column(String(20), nullable=True)
    month_name = Column(String(20), nullable=True)
    year_val = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
