from functools import wraps
from fastapi import HTTPException, status, Depends
from app.api.dependencies.auth import get_current_user


def require_auth(func):
    """
    Decorator to ensure the user is authenticated.
    Injects `current_user` automatically.
    """

    @wraps(func)
    def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Check email verification status
        if not getattr(current_user, "is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email verification required to access this resource.",
            )

        return func(*args, current_user=current_user, **kwargs)

    return wrapper
