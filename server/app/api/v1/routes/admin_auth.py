from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.services.admin_auth_service import AdminAuthService
from app.schemas.admin_auth import AdminCreate
from app.api.dependencies.db import get_db

router = APIRouter(prefix="/admin", tags=["Admin Auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_admin(admin_data: AdminCreate, db: Session = Depends(get_db)):
    """
    Register a new superuser/admin.
    NOTE: This endpoint should be **protected** or disabled in production.
    """
    return AdminAuthService.register_admin(db=db, admin_data=admin_data)

@router.post("/login")
def login_admin(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Admin login — only superusers.
    """
    return AdminAuthService.login_admin(db=db, email=form_data.username, password=form_data.password)
