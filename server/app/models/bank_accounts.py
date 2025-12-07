# app/models/bank_accounts.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.models.base import Base
from sqlalchemy.orm import relationship

class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    account_number = Column(String(20), nullable=False)
    balance = Column(Float, default=0.0)
    last_sync = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bank_accounts")
