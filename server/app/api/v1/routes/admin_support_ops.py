# app/api/v1/routes/admin_support_ops.py
from fastapi import APIRouter, Depends, Body, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.subscription import Subscription
from app.models.payment import Payment
from app.models.support_ticket import SupportTicket
from app.schemas.subscription import SubscriptionOut, SubscriptionUpdate
from app.schemas.payment import PaymentOut, PaymentUpdate
from app.schemas.support_ticket import SupportTicketOut, SupportTicketUpdate

router = APIRouter(prefix="/admin/support", tags=["Admin Support & Operations"])

# Helper: check admin/finance roles
def ensure_admin_roles(user: User, allowed_roles: List[str]):
    user_role = getattr(user, "role", None)  # Option 2: fallback if role exists
    if not user.is_superuser and (user_role not in allowed_roles):
        raise HTTPException(status_code=403, detail="Not authorized")


# -----------------------------
# Subscriptions
# -----------------------------
@router.get("/subscriptions", response_model=List[SubscriptionOut])
def list_subscriptions(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Option 2: role-less check using superuser or permission flags
    if not getattr(current_user, "is_superuser", False):
        # Or add other permission checks if you have a 'permissions' field
        raise HTTPException(status_code=403, detail="Not authorized")
    
    subscriptions = db.query(Subscription).all()
    return subscriptions

@router.patch("/subscriptions/{subscription_id}", response_model=SubscriptionOut)
def update_subscription(
    subscription_id: int,
    data: SubscriptionUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_admin_roles(current_user, ["finance", "compliance"])
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(sub, k, v)
    db.commit()
    db.refresh(sub)
    return SubscriptionOut(
        id=sub.id,
        user_id=sub.user_id,
        plan_name=sub.plan_name,
        status=sub.status,
        mrr=sub.mrr,
        churned=sub.churned
    )


# -----------------------------
# Payments
# -----------------------------
@router.get("/payments", response_model=List[PaymentOut])
def list_payments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_admin_roles(current_user, ["accountant", "finance"])
    payments = db.query(Payment).all()
    return [
        PaymentOut(
            id=p.id,
            user_id=p.user_id,
            amount=p.amount,
            status=p.status,
            refunded=p.refunded,
            refunded_at=p.refunded_at
        )
        for p in payments
    ]


@router.patch("/payments/{payment_id}/refund", response_model=PaymentOut)
def refund_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_admin_roles(current_user, ["accountant", "finance"])
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = "refunded"
    payment.refunded = True
    payment.refunded_at = datetime.utcnow()
    db.commit()
    db.refresh(payment)
    return PaymentOut(
        id=payment.id,
        user_id=payment.user_id,
        amount=payment.amount,
        status=payment.status,
        refunded=payment.refunded,
        refunded_at=payment.refunded_at
    )


# -----------------------------
# Support Tickets
# -----------------------------
@router.get("/tickets", response_model=List[SupportTicketOut])
def list_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_admin_roles(current_user, ["support"])
    tickets = db.query(SupportTicket).all()
    return [
        SupportTicketOut(
            id=t.id,
            subject=t.subject,
            description=t.description,
            status=t.status,
            created_on=t.created_at,
            last_updated=t.updated_at,
            user_id=t.user_id,
            user_name=t.user.full_name if t.user else None
        )
        for t in tickets
    ]


@router.patch("/tickets/{ticket_id}", response_model=SupportTicketOut)
def update_ticket(ticket_id: int, data: SupportTicketUpdate = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_admin_roles(current_user, ["support"])
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(ticket, k, v)
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return SupportTicketOut(
        id=ticket.id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        created_on=ticket.created_at,
        last_updated=ticket.updated_at,
        user_id=ticket.user_id,
        user_name=ticket.user.full_name if ticket.user else None
    )
