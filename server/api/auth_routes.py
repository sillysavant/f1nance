from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import auth
from .. import db as _db
from ..models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(req: SignupRequest, session: Session = Depends(_db.get_db)):
    # check if user exists
    existing = session.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = auth.hash_password(req.password)
    user = User(email=req.email, hashed_password=hashed)
    session.add(user)
    session.commit()
    session.refresh(user)
    token = auth.create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
def login(req: LoginRequest, session: Session = Depends(_db.get_db)):
    user = session.query(User).filter(User.email == req.email).first()
    if not user or not auth.verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}
