from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.core.security import decode_token

class TenantContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Default state
        request.state.center_id = None
        request.state.user_id = None
        request.state.user_role = None
        request.state.is_authenticated = False

        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload:
                request.state.is_authenticated = True
                request.state.user_id = payload.get("user_id")
                request.state.user_role = payload.get("role")
                # center_id will be an integer/string for center users, or None for Super Admin
                request.state.center_id = payload.get("center_id")

        response = await call_next(request)
        return response
