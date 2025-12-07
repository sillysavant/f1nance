from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.engagement import UserEngagement
from app.schemas.engagement import EngagementOut

router = APIRouter(prefix="/engagements", tags=["Engagements"])

# GET /api/v1/engagements
@router.get("/", response_model=List[EngagementOut])
def get_engagements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    engagements = db.query(UserEngagement).filter(UserEngagement.user_id == current_user.id).all()
    return engagements  # Pydantic schema handles JSON serialization

# POST /api/v1/engagements/{id}/done
@router.post("/{engagement_id}/done", response_model=EngagementOut)
def mark_done(
    engagement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    engagement = db.query(UserEngagement).filter(
        UserEngagement.id == engagement_id,
        UserEngagement.user_id == current_user.id
    ).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")

    engagement.is_done = True
    db.commit()
    db.refresh(engagement)
    return engagement

# POST /api/v1/engagements/{id}/snooze
@router.post("/{engagement_id}/snooze", response_model=EngagementOut)
def snooze_engagement(
    engagement_id: int,
    snoozed_until: datetime = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    engagement = db.query(UserEngagement).filter(
        UserEngagement.id == engagement_id,
        UserEngagement.user_id == current_user.id
    ).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")

    engagement.snoozed_until = snoozed_until
    db.commit()
    db.refresh(engagement)
    return engagement