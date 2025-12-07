# A:\f1nance\server\app\api\v1\routes\admin_support_ticket.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user  # admin user dependency
from app.models.support_ticket import SupportTicket
from app.schemas.support_ticket import SupportTicketOut
from app.schemas.support_ticket import SupportTicketUpdate

router = APIRouter(prefix="/admin/support-tickets", tags=["Admin Support Tickets"])

@router.get("/", response_model=List[SupportTicketOut])
def list_tickets(db: Session = Depends(get_db), admin=Depends(get_current_user)):
    return db.query(SupportTicket).order_by(SupportTicket.created_on.desc()).all()

@router.put("/{ticket_id}/", response_model=SupportTicketOut)
def update_ticket_status(
    ticket_id: int,
    ticket_in: SupportTicketUpdate,  # <--- expects JSON body
    db: Session = Depends(get_db),
    admin=Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Update only fields provided
    for field, value in ticket_in.dict(exclude_unset=True).items():
        setattr(ticket, field, value)

    ticket.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/{ticket_id}/")
def delete_ticket(ticket_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    return {"detail": "Ticket deleted"}
