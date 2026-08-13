from typing import List, Callable
from fastapi import Request, HTTPException, status, Depends

def get_current_user_state(request: Request):
    if not getattr(request.state, "is_authenticated", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing or invalid"
        )
    return {
        "user_id": request.state.user_id,
        "role": request.state.user_role,
        "center_id": request.state.center_id
    }

def role_guard(allowed_roles: List[str]):
    def dependency(request: Request):
        if not getattr(request.state, "is_authenticated", False):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token missing or invalid"
            )
        user_role = request.state.user_role
        if user_role not in allowed_roles and user_role != "SUPER_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user_role}' is not authorized to access this resource"
            )
        return {
            "user_id": request.state.user_id,
            "role": user_role,
            "center_id": request.state.center_id
        }
    return dependency
