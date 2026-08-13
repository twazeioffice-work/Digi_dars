from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.security import decode_token
from app.core.context import current_tenant_id, current_user_id, current_user_role

PUBLIC_ROUTES = [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/docs",
    "/openapi.json",
    "/redoc"
]

class TenantAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Reset context variables for new request lifecycle
        t_token = current_tenant_id.set(None)
        u_token = current_user_id.set(None)
        r_token = current_user_role.set(None)

        # 2. Bypass auth for public endpoints
        if any(request.url.path.startswith(route) for route in PUBLIC_ROUTES):
            return await call_next(request)

        # 3. Extract Authorization Header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            # Allow request to proceed (handled downstream or by guards)
            return await call_next(request)

        token = auth_header.split(" ")[1]
        payload = decode_token(token)

        if not payload:
            return JSONResponse(
                status_code=401,
                content={"detail": "Could not validate credentials or token expired"}
            )

        # 4. Set Context Variables for this specific async request
        center_id = payload.get("center_id")
        user_id = payload.get("user_id") or payload.get("sub")
        user_role = payload.get("role") or payload.get("user_role")

        current_tenant_id.set(center_id)
        current_user_id.set(user_id)
        current_user_role.set(user_role)

        # Also set request.state for backward compatibility with route handlers
        request.state.center_id = center_id
        request.state.user_id = user_id
        request.state.user_role = user_role

        return await call_next(request)

TenantContextMiddleware = TenantAuthMiddleware

