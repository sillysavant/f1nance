# server/app/models/engagement.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base

class UserEngagement(Base):
    __tablename__ = "user_engagements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_name = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)  # e.g., 'viewed', 'completed', 'started'
    timestamp = Column(DateTime, default=datetime.utcnow)
    critical_date = Column(DateTime, nullable=True)  # for deadlines
    snoozed_until = Column(DateTime, nullable=True)
    is_done = Column(Boolean, default=False)

    user = relationship("User", back_populates="engagements")
