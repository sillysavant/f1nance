from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.schemas.auth import UpdateUserProfileRequest, UserResponse
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.core.decorators.require_auth import require_auth
from app.core.decorators.handle_exceptions import handle_exceptions
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["Users"])


@router.patch("/me", response_model=UserResponse)
@require_auth
@handle_exceptions
def update_current_user(
    data: UpdateUserProfileRequest = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Update fields of the currently authenticated user.
    Delegates to AuthService.update_user_profile for central logic.
    """
    return AuthService.update_user_profile(db=db, user=current_user, data=data)
