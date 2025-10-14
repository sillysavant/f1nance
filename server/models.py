# models.py
import uuid
from enum import Enum as PyEnum
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Numeric,
    Boolean,
    Text,
    Index,
    UniqueConstraint,
    func,
    SmallInteger,
    JSON,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from .db import Base

# -----------------
# Shared Python Enums
# -----------------
class UserRole(PyEnum):
    STUDENT = "student"
    GUARDIAN = "guardian"
    INTERNAL = "internal"


class TransactionDirection(PyEnum):
    CREDIT = "credit"
    DEBIT = "debit"


class BudgetStatus(PyEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"


class SubscriptionStatus(PyEnum):
    ACTIVE = "active"
    CANCELED = "canceled"
    EXPIRED = "expired"


class PaymentStatus(PyEnum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


# -----------------
# Mixins / Utilities
# -----------------
class TimestampMixin:
    created_at = Column(
        DateTime(timezone=False),
        nullable=False,
        default=datetime.utcnow,
        server_default=func.now(),
    )
    updated_at = Column(
        DateTime(timezone=False),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=func.now(),
    )


# -----------------
# Models
# -----------------
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(
        SAEnum(UserRole, name="user_role_enum", native_enum=True),
        nullable=False,
        index=True,
    )
    visa_status = Column(String(128), nullable=True)
    phone = Column(String(50), nullable=True)

    # Relationships
    bank_accounts = relationship("BankAccount", back_populates="user", cascade="all,delete-orphan")
    # Transactions through BankAccount
    transactions = relationship(
        "Transaction",
        secondary="bank_accounts",
        primaryjoin="User.id==BankAccount.user_id",
        secondaryjoin="Transaction.bank_account_id==BankAccount.id",
        viewonly=True,
    )
    documents = relationship("Document", back_populates="user", cascade="all,delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all,delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all,delete-orphan")
    support_tickets = relationship("SupportTicket", back_populates="requester", cascade="all,delete-orphan")


class StudentGuardian(Base):
    __tablename__ = "student_guardian"
    # Composite PK (student_id, guardian_id)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    guardian_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    relation_type = Column(String(128), nullable=True)

    # relationships
    student = relationship("User", foreign_keys=[student_id], backref=backref("guardians", cascade="all,delete-orphan"))
    guardian = relationship("User", foreign_keys=[guardian_id], backref=backref("students", cascade="all,delete-orphan"))


class BankAccount(Base, TimestampMixin):
    __tablename__ = "bank_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_name = Column(String(150), nullable=False)
    account_type = Column(String(50), nullable=True)
    account_mask = Column(String(20), nullable=True)
    currency_code = Column(String(8), nullable=True)
    active = Column(Boolean, nullable=False, default=True)
    linked_at = Column(DateTime(timezone=False), nullable=True)
    item_id = Column(String(255), nullable=True)
    access_token_encrypted = Column(Text, nullable=True)

    user = relationship("User", back_populates="bank_accounts")
    transactions = relationship("Transaction", back_populates="bank_account", cascade="all,delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False, index=True)
    type = Column(String(20), nullable=False)
    sort_order = Column(SmallInteger, nullable=True, default=0)

    parent = relationship("Category", remote_side=[id], backref="children")


class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bank_account_id = Column(UUID(as_uuid=True), ForeignKey("bank_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    provider_tx_id = Column(String(255), unique=True, index=True, nullable=True)
    posted_on = Column(DateTime(timezone=False), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    direction = Column(
        SAEnum(TransactionDirection, name="transaction_direction_enum", native_enum=True),
        nullable=True,
        index=True,
    )
    currency = Column(String(8), nullable=True)
    description = Column(Text, nullable=True)
    raw = Column(JSONB, nullable=True)
    imported_at = Column(DateTime(timezone=False), nullable=True)

    bank_account = relationship("BankAccount", back_populates="transactions")
    category = relationship("Category", backref="transactions")


class Budget(Base, TimestampMixin):
    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    period_start = Column(DateTime(timezone=False), nullable=False)
    period_end = Column(DateTime(timezone=False), nullable=False)
    status = Column(
        SAEnum(BudgetStatus, name="budget_status_enum", native_enum=True),
        nullable=False,
        default=BudgetStatus.DRAFT,
        index=True,
    )
    created_by = Column(UUID(as_uuid=True), nullable=True)

    user = relationship("User", backref="budgets")
    items = relationship("BudgetItem", back_populates="budget", cascade="all,delete-orphan")


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    budget_id = Column(UUID(as_uuid=True), ForeignKey("budgets.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    target_amount = Column(Numeric(14, 2), nullable=False)
    alert_threshold = Column(Numeric(5, 2), nullable=True)

    budget = relationship("Budget", back_populates="items")
    category = relationship("Category")


class Provider(Base):
    __tablename__ = "providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, unique=True)
    provider_metadata = Column(JSONB, nullable=True)  # fixed reserved 'metadata'
    created_at = Column(DateTime(timezone=False), nullable=False, server_default=func.now())


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_code = Column(String(100), nullable=False)
    status = Column(
        SAEnum(SubscriptionStatus, name="subscription_status_enum", native_enum=True),
        nullable=False,
        default=SubscriptionStatus.ACTIVE,
        index=True,
    )
    current_period_start = Column(DateTime(timezone=False), nullable=True)
    current_period_end = Column(DateTime(timezone=False), nullable=True)
    subscription_metadata = Column(JSONB, nullable=True)  # fixed reserved 'metadata'

    user = relationship("User", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription", cascade="all,delete-orphan")


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("providers.id", ondelete="SET NULL"), nullable=True, index=True)
    amount = Column(Numeric(14, 2), nullable=False)
    currency_code = Column(String(8), nullable=False)
    status = Column(
        SAEnum(PaymentStatus, name="payment_status_enum", native_enum=True),
        nullable=False,
        default=PaymentStatus.PENDING,
        index=True,
    )
    paid_at = Column(DateTime(timezone=False), nullable=True)
    provider_payload = Column(JSONB, nullable=True)

    subscription = relationship("Subscription", back_populates="payments")
    provider = relationship("Provider")


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    doc_type = Column(String(100), nullable=True)
    storage_uri = Column(String(1024), nullable=False)
    ocr_meta = Column(JSONB, nullable=True)
    uploaded_at = Column(DateTime(timezone=False), nullable=True)
    verified = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="documents")


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(50), nullable=False)
    template_key = Column(String(200), nullable=True)
    payload = Column(JSONB, nullable=True)
    read = Column(Boolean, nullable=False, default=False)
    sent_at = Column(DateTime(timezone=False), nullable=True)
    read_at = Column(DateTime(timezone=False), nullable=True)

    user = relationship("User", back_populates="notifications")


class SupportTicket(Base, TimestampMixin):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    status = Column(String(50), nullable=True)
    priority = Column(Integer, nullable=True)

    requester = relationship("User", foreign_keys=[requester_id], back_populates="support_tickets")
    assignee = relationship("User", foreign_keys=[assignee_id], backref="assigned_tickets")


# -----------------
# Indexes and Constraints
# -----------------
UniqueConstraint(Provider.name, name="uq_provider_name")
