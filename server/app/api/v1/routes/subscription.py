from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate, SubscriptionOut
from datetime import datetime

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

# -------------------
# Get current user's subscription
# -------------------
@router.get("/me", response_model=SubscriptionOut | None)
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    return sub

# -------------------
# Create a subscription
# -------------------
@router.post("/create", response_model=SubscriptionOut, status_code=status.HTTP_201_CREATED)
def create_subscription(
    subscription_in: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Prevent duplicate subscription
    existing = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subscription already exists")

    sub = Subscription(
        user_id=current_user.id,  # assign from authenticated user
        plan_name=subscription_in.plan_name,
        status="active",
        mrr=49.99 if subscription_in.plan_name.lower() == "pro" else 0,
        churned=False,
        started_at=datetime.utcnow()
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub
