# app/api/v1/routes/admin_dashboard_ops.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.subscription import Subscription
from app.models.payment import Payment
from app.models.support_ticket import SupportTicket

router = APIRouter(prefix="/admin", tags=["Admin Dashboard Ops"])

# -----------------------------
# Get current admin info
# -----------------------------
@router.get("/me")
def get_admin_info(current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
    }

# -----------------------------
# Dashboard stats
# -----------------------------
@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only superusers can access
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Total Users
    total_users = db.query(User).count()

    # Pending Tickets
    pending_tickets = db.query(SupportTicket).filter(SupportTicket.status == "Open").count()

    # Revenue (sum of all non-refunded payments)
    revenue = db.query(Payment).filter(Payment.refunded == False).with_entities(
        Payment.amount
    ).all()
    total_revenue = sum([r[0] for r in revenue]) if revenue else 0

    # Financial Score (% of non-churned subscriptions)
    total_subs = db.query(Subscription).count()
    non_churned_subs = db.query(Subscription).filter(Subscription.churned == False).count()
    financial_score = int((non_churned_subs / total_subs) * 100) if total_subs > 0 else 0

    return {
        "total_users": total_users,
        "pending_tickets": pending_tickets,
        "total_revenue": total_revenue,
        "financial_score": financial_score,
    }
