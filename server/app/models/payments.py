from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    done = "done"
    due = "due"

class ScheduledPayment(Base):
    __tablename__ = "scheduled_payments"  # NEW table
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), default="")
    scheduled_date = Column(DateTime, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)

    user = relationship("User", back_populates="scheduled_payments")