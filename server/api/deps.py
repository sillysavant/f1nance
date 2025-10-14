from typing import Optional

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .. import auth as _auth
from .. import db as _db
from ..models import User as _User


def get_db() -> Session:
    yield from _db.get_db()


def get_current_user(request: Request, session: Session = Depends(get_db)) -> _User:
    auth_header: Optional[str] = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ", 1)[1].strip()
    payload = _auth.decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload["sub"]
    user = session.query(_User).filter(_User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
