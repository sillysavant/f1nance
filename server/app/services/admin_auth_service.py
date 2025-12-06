from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.models.users import User
from app.schemas.admin_auth import AdminCreate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

class AdminAuthService:
    @staticmethod
    def register_admin(db: Session, admin_data: AdminCreate):
        # Only allow creation if admin does NOT exist yet
        existing = db.query(User).filter(User.email == admin_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin email already registered"
            )
        hashed_pw = get_password_hash(admin_data.password)
        user = User(
            email=admin_data.email,
            username=admin_data.username,
            full_name=admin_data.full_name,
            hashed_password=hashed_pw,
            is_superuser=True,  # force admin
            is_active=True,
            is_verified=True,   # admin is verified by default
            visa_status="N/A",
            education="N/A",
            nationality="N/A"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login_admin(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email, User.is_superuser == True).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin email or password"
            )
        access_token = create_access_token(
            data={"sub": str(user.id)}, 
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
