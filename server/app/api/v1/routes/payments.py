from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.payments import ScheduledPayment, PaymentStatus
from app.schemas.payments import PaymentCreate, PaymentUpdate, PaymentOut

router = APIRouter(prefix="/payments", tags=["Scheduled Payments"])

# -------------------
# List scheduled payments
# -------------------
@router.get("/", response_model=List[PaymentOut])
def list_scheduled_payments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payments = db.query(ScheduledPayment).filter(ScheduledPayment.user_id == current_user.id).all()
    
    # Automatically mark overdue payments as due
    today = datetime.utcnow()
    updated = False
    for p in payments:
        if p.status == PaymentStatus.pending and p.scheduled_date < today:
            p.status = PaymentStatus.due
            updated = True
    if updated:
        db.commit()
    
    return payments

# -------------------
# Create scheduled payment
# -------------------
@router.post("/", response_model=PaymentOut)
def create_scheduled_payment(payment_in: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Determine initial status
    status = PaymentStatus.pending
    if payment_in.scheduled_date < datetime.utcnow():
        status = PaymentStatus.due

    payment = ScheduledPayment(
        user_id=current_user.id,
        amount=payment_in.amount,
        description=payment_in.description,
        scheduled_date=payment_in.scheduled_date,
        status=status
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

# -------------------
# Update scheduled payment
# -------------------
@router.put("/{payment_id}/", response_model=PaymentOut)
def update_scheduled_payment(payment_id: int, payment_in: PaymentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(ScheduledPayment).filter(
        ScheduledPayment.id == payment_id, 
        ScheduledPayment.user_id == current_user.id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Scheduled payment not found")
    
    for field, value in payment_in.dict(exclude_unset=True).items():
        setattr(payment, field, value)
    
    db.commit()
    db.refresh(payment)
    return payment
@router.put("/{payment_id}/mark-done", response_model=PaymentOut)
def mark_scheduled_payment_done(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(ScheduledPayment).filter(
        ScheduledPayment.id == payment_id,
        ScheduledPayment.user_id == current_user.id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Scheduled payment not found")
    
    payment.status = PaymentStatus.done
    db.commit()
    db.refresh(payment)
    return payment
# -------------------
# Delete scheduled payment
# -------------------
@router.delete("/{payment_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_scheduled_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(ScheduledPayment).filter(
        ScheduledPayment.id == payment_id, 
        ScheduledPayment.user_id == current_user.id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Scheduled payment not found")
    db.delete(payment)
    db.commit()
    return {"detail": "Scheduled payment deleted successfully"}
