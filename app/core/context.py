from contextvars import ContextVar
from typing import Optional

# These hold the state for the lifecycle of a single asynchronous request
current_tenant_id: ContextVar[Optional[str]] = ContextVar("current_tenant_id", default=None)
current_user_id: ContextVar[Optional[str]] = ContextVar("current_user_id", default=None)
current_user_role: ContextVar[Optional[str]] = ContextVar("current_user_role", default=None)
