from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base


class UserAuditLog(Base):
    __tablename__ = "user_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(String(500), nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="audit_logs")
