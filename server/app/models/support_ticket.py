from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    subject = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    status = Column(String(50), nullable=False, default="Open")  # Open, In Progress, Resolved, Closed
    created_on = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to User
    user = relationship("User", back_populates="support_tickets")

    @property
    def user_name(self):
        return self.user.full_name if hasattr(self.user, "full_name") else str(self.user_id)

    def __repr__(self) -> str:
        return f"<SupportTicket id={self.id} subject='{self.subject}' status={self.status}>"
