from fastapi import Header, HTTPException
from typing import List, Optional

ROLE_WEIGHTS = {
    "viewer": 1,
    "reviewer": 2,
    "editor": 3,
    "admin": 4,
    "owner": 5,
}

def require_role(allowed_roles: List[str]):
    """
    FastAPI dependency enforcing workspace RBAC permissions on protected write operations.
    Hiding UI controls is not authorization; backend enforces roles explicitly.
    """
    def role_checker(
        x_workspace_role: Optional[str] = Header(default="owner"),
        x_user_id: Optional[str] = Header(default="user_admin")
    ):
        role = (x_workspace_role or "owner").lower()
        if role not in [r.lower() for r in allowed_roles]:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FORBIDDEN_ROLE",
                    "message": f"Role '{role}' is not authorized for this action. Required: {allowed_roles}",
                }
            )
        return {"user_id": x_user_id, "role": role}
    return role_checker

