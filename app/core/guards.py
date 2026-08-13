from typing import List
from fastapi import HTTPException, status, Request
from app.core.context import current_user_role

class RoleGuard:
    """
    Dependency to enforce Role-Based Access Control (RBAC).
    Usage: Depends(RoleGuard(["SUPER_ADMIN", "NAZIM"]))
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, request: Request):
        role = current_user_role.get()
        if not role and hasattr(request.state, "user_role"):
            role = getattr(request.state, "user_role", None)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Role context missing"
            )

        if role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You do not have permission to perform this action (not authorized for this role)"
            )

role_guard = RoleGuard
