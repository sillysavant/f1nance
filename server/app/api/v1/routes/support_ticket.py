from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.schemas.support_ticket import (
    SupportTicketCreate,
    SupportTicketUpdate,
    SupportTicketOut
)
from app.models.support_ticket import SupportTicket

router = APIRouter(prefix="/support-tickets", tags=["Support Tickets"])

# -------------------
# List all tickets for the current user
# -------------------
@router.get("/", response_model=List[SupportTicketOut])
def list_tickets(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(SupportTicket).filter(SupportTicket.user_id == user.id).order_by(SupportTicket.created_on.desc()).all()

# -------------------
# Create a ticket
# -------------------
@router.post("/", response_model=SupportTicketOut)
def create_ticket(ticket_in: SupportTicketCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ticket = SupportTicket(
        subject=ticket_in.subject,
        description=ticket_in.description,
        status=ticket_in.status if ticket_in.status else "Open",
        user_id=user.id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

# -------------------
# Update a ticket
# -------------------
@router.put("/{ticket_id}/", response_model=SupportTicketOut)
def update_ticket(ticket_id: int, ticket_in: SupportTicketUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id, SupportTicket.user_id == user.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    for field, value in ticket_in.dict(exclude_unset=True).items():
        setattr(ticket, field, value)

    ticket.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket

# -------------------
# Delete a ticket
# -------------------
@router.delete("/{ticket_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id, SupportTicket.user_id == user.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.delete(ticket)
    db.commit()
    return {"detail": "Ticket deleted"}
