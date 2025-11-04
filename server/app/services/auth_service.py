from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.models.users import User
from app.models.audit import UserAuditLog
from app.schemas.auth import UserCreate, Token
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_email_verification_token,
    create_email_verification_token,
)
from app.core.config import settings
from app.services.email_service import EmailService


class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserCreate):
        try:
            existing_user = db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )

            hashed_pw = get_password_hash(user_data.password)
            user = User(
                email=user_data.email,
                username=user_data.username,
                full_name=user_data.full_name,
                hashed_password=hashed_pw,
                visa_status=user_data.visa_status,
                education=user_data.education,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            EmailService.send_verification_email(user.email)

            return user

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(e)}",
            )

    @staticmethod
    def verify_email(db: Session, user: User, token: str):
        """Verify a user's email from the token."""
        if user.is_verified:
            return {"message": "Email already verified"}

        try:
            email = verify_email_verification_token(token)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification link.",
            )

        if email != user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification link.",
            )

        user.is_verified = True
        db.commit()
        db.refresh(user)

        return {"message": "Email verified successfully"}

    @staticmethod
    def login_user(db: Session, email: str, password: str) -> Token:
        """Authenticate and return a JWT token for verified users."""
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        message = "Logged in successfully"

        if not user.is_verified:
            message = "Please verify your email to access the product."

        return Token(access_token=access_token, token_type="bearer", message=message)

    @staticmethod
    def resend_verification_email(db: Session, user: User):
        """Resend the email verification link to a logged-in (unverified) user."""
        if user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already verified.",
            )

        token = create_email_verification_token(user.email)
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        EmailService.send_verification_email(
            to_email=user.email, verification_url=verification_url
        )

        return {"message": "Verification email resent successfully."}

    @staticmethod
    def log_profile_change(db: Session, user: User, details: str):
        """Audit log entry for user profile modifications."""
        try:
            log = UserAuditLog(
                user_id=user.id,
                action="PROFILE_UPDATE",
                details=details,
            )
            db.add(log)
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to log profile change.",
            )
