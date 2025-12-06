from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="pending")  # completed, refunded
    promo_code = Column(String(50), nullable=True)
    refunded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    refunded_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="payments")