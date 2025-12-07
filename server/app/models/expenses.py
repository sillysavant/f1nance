from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), default="")
    date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="expenses")
