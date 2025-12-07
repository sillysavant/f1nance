# app/models/tax_resource.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class TaxResource(Base):
    __tablename__ = "tax_resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    title = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    access = Column(String(20), nullable=False)  # "Public" | "Restricted"
    download_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to User
    user = relationship("User", back_populates="tax_resources")
