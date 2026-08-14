from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class LibrarySearchRequest(BaseModel):
    query: str = Field(..., alias="q", description="The search query text (e.g. 'shalat malam')")
    limit: int = Field(default=5, ge=1, le=50)
    type: str = Field(default="hadith", description="Search type, e.g. hadith, author, book")

    model_config = {
        "populate_by_name": True
    }

class LibraryConfigUpdate(BaseModel):
    is_enabled_for_all: bool

class LibraryConfigResponse(BaseModel):
    center_id: str
    is_enabled_for_all: bool
    is_hadith_api_active: bool
    last_updated_by: Optional[str] = None
    updated_at: Optional[str] = None
