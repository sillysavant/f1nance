from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.auth import Token, UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.core.decorators.rate_limiter import rate_limit
from app.core.decorators.require_auth import require_auth
from app.core.decorators.handle_exceptions import handle_exceptions

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
@handle_exceptions
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    """
    return AuthService.register_user(db=db, user_data=user_data)


@router.post("/login", response_model=Token)
@handle_exceptions
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Authenticate user and return a JWT access token.
    """
    return AuthService.login_user(
        db=db, email=form_data.username, password=form_data.password
    )


@router.get("/me", response_model=UserResponse)
@require_auth
@handle_exceptions
def read_current_user(current_user):
    """
    Retrieve the currently authenticated user.
    """
    return current_user


@router.post("/verify-email")
@handle_exceptions
def verify_email(
    token: str = Query(..., description="Email verification token"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Verify user's email.
    """
    return AuthService.verify_email(db=db, user=current_user, token=token)


@router.post("/resend-verification", status_code=status.HTTP_200_OK)
@rate_limit(limit_seconds=120, prefix="resend_verification")
@handle_exceptions
def resend_verification(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    """
    Resend email verification link (only for logged-in users, 1 per 2 min).
    """
    return AuthService.resend_verification_email(db=db, user=current_user)
