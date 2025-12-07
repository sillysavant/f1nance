# app/models/__init__.py

# Import all models so SQLAlchemy knows about all mappers
from .users import User
from .documents import UserDocument
from .bank_accounts import BankAccount
# from .audit_logs import UserAuditLog  # Uncomment if using audit logs
