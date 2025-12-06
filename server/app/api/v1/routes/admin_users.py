from fastapi import APIRouter, Depends, Body, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.users import User
from app.schemas.users import UserOut
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


# ---------------------------
# Dependency: admin-only
# ---------------------------
def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


# ---------------------------
# GET all users
# ---------------------------
@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(User).all()


# ---------------------------
# CREATE a new user
# ---------------------------
@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    # Required fields check
    required = ["username", "email", "password", "nationality", "education"]
    for field in required:
        if field not in payload:
            raise HTTPException(status_code=400, detail=f"{field} is required")

    # Check uniqueness
    if db.query(User).filter(User.email == payload["email"]).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if db.query(User).filter(User.username == payload["username"]).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = get_password_hash(payload["password"])

    user = User(
        username=payload["username"],
        email=payload["email"],
        hashed_password=hashed_password,
        full_name=payload.get("full_name"),
        nationality=payload["nationality"],
        education=payload["education"],
        visa_status=payload.get("visa_status"),
        is_active=payload.get("is_active", True),
        is_verified=payload.get("is_verified", False),
        is_superuser=payload.get("is_superuser", False),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------
# UPDATE a user
# ---------------------------
@router.put("/{user_id}/", response_model=UserOut)
def update_user(
    user_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    for field in ["username", "email", "full_name", "nationality", "education", "visa_status", "is_active", "is_verified", "is_superuser"]:
        if field in payload:
            setattr(user, field, payload[field])

    # Handle password separately
    if "password" in payload:
        user.hashed_password = get_password_hash(payload["password"])

    db.commit()
    db.refresh(user)
    return user


# ---------------------------
# DELETE a user
# ---------------------------
@router.delete("/{user_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"ok": True}
