# in app/models/users.py

from datetime import datetime
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from app.models.currency_tracing import CurrencyTrace


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    visa_status = Column(String(50), nullable=True)
    education = Column(String(100), nullable=False)
    nationality = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Audit relationship
    audit_logs = relationship("UserAuditLog", back_populates="user")

    # Documents relationship
    documents = relationship("UserDocument", back_populates="user", lazy="dynamic")

    # Bank accounts relationship
    bank_accounts = relationship("BankAccount", back_populates="user", lazy="dynamic")

    # Expenses relationship
    expenses = relationship("Expense", back_populates="user", lazy="dynamic")

    # Income relationship
    income = relationship("Income", back_populates="user", lazy="dynamic")

    # Currency tracing
    currency_traces = relationship("CurrencyTrace", back_populates="user", lazy="dynamic")

    # Engagements
    engagements = relationship("UserEngagement", back_populates="user", lazy="dynamic")

    # ---------------------------
    # Financial Literacy Modules
    # ---------------------------
    financial_modules = relationship(
        "FinancialModule",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )

    subscriptions = relationship(
    "Subscription",
    back_populates="user",
    lazy="dynamic",
    cascade="all, delete-orphan"
    )

    # ---------------------------
    # Tax Compliance Resources
    # ---------------------------
    tax_resources = relationship(
        "TaxResource",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )

    # Payments relationship
    payments = relationship(
        "Payment",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )

    # Support tickets
    support_tickets = relationship(
        "SupportTicket",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )

    scheduled_payments = relationship(
    "ScheduledPayment",
    back_populates="user",
    lazy="dynamic",
    cascade="all, delete-orphan"
)


    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"
