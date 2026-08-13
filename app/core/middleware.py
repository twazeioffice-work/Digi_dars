from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import structlog
import time
from uuid import uuid4

from app.core.security import decode_token
from app.core.context import current_tenant_id, current_user_id, current_user_role

logger = structlog.get_logger()

PUBLIC_ROUTES = [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/docs",
    "/openapi.json",
    "/redoc"
]

class TenantAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Generate a unique ID for tracing this specific HTTP request
        request_id = request.headers.get("X-Request-ID", str(uuid4()))
        
        # 1. Bind initial context for structlog
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        start_time = time.perf_counter()

        # Reset context variables for new request lifecycle
        t_token = current_tenant_id.set(None)
        u_token = current_user_id.set(None)
        r_token = current_user_role.set(None)

        # Extract Authorization Header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload:
                center_id = payload.get("center_id")
                user_id = payload.get("user_id") or payload.get("sub")
                user_role = payload.get("role") or payload.get("user_role")

                current_tenant_id.set(center_id)
                current_user_id.set(user_id)
                current_user_role.set(user_role)

                request.state.center_id = center_id
                request.state.user_id = user_id
                request.state.user_role = user_role

                # Bind Tenant ID and Role to structlog
                structlog.contextvars.bind_contextvars(
                    tenant_id=center_id,
                    user_role=user_role
                )

        try:
            response = await call_next(request)
            
            process_time = time.perf_counter() - start_time
            logger.info(
                "http_request_completed",
                status_code=response.status_code,
                duration_ms=round(process_time * 1000, 2)
            )
            return response
            
        except Exception as e:
            process_time = time.perf_counter() - start_time
            logger.exception(
                "http_request_failed",
                error=str(e),
                duration_ms=round(process_time * 1000, 2)
            )
            raise

TenantContextMiddleware = TenantAuthMiddleware
