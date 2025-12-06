from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine
from app.models import base

# Routers
from app.api.v1.routes import auth
from app.api.v1.routes import user
from app.api.v1.routes import documents
from app.api.v1.routes import bank_accounts
from app.api.v1.routes import expenses
from app.api.v1.routes import income
from app.api.v1.routes import currency_tracing
from app.api.v1.routes import engagement
from app.api.v1.routes import financial
from app.api.v1.routes import tax_resources
from app.api.v1.routes import support_ticket  # user support tickets
from app.api.v1.routes import admin_auth
from app.api.v1.routes import admin_support_ticket  # <-- admin support tickets router
from app.api.v1.routes import admin_financial_modules
from app.api.v1.routes import admin_support_ops
from app.api.v1.routes import admin_dashboard_ops
from app.api.v1.routes import payments
from app.api.v1.routes import subscription  # <- import subscription router
from app.api.v1.routes import admin_users

# Create all database tables
base.Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(admin_auth.router, prefix="/api/v1", tags=["admin_auth"])
app.include_router(user.router, prefix="/api/v1", tags=["users"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(bank_accounts.router, prefix="/api/v1", tags=["bank_accounts"])
app.include_router(expenses.router, prefix="/api/v1", tags=["expenses"])
app.include_router(income.router, prefix="/api/v1", tags=["income"])
app.include_router(currency_tracing.router, prefix="/api/v1", tags=["currency"])
app.include_router(engagement.router, prefix="/api/v1", tags=["engagement"])
app.include_router(financial.router, prefix="/api/v1", tags=["financial_modules"])
app.include_router(tax_resources.router, prefix="/api/v1", tags=["tax_resources"])
app.include_router(support_ticket.router, prefix="/api/v1", tags=["support_tickets"])  # user tickets
app.include_router(admin_support_ticket.router, prefix="/api/v1", tags=["admin_support_tickets"])  # admin tickets
app.include_router(admin_financial_modules.router, prefix="/api/v1", tags=["admin_financial_modules"])
app.include_router(admin_support_ops.router, prefix="/api/v1", tags=["admin_support_ops"])
app.include_router(admin_dashboard_ops.router, prefix="/api/v1", tags=["admin_dashboard_ops"])
app.include_router(payments.router, prefix="/api/v1", tags=["payments"])
app.include_router(subscription.router, prefix="/api/v1", tags=["subscriptions"])
app.include_router(admin_users.router, prefix="/api/v1", tags=["admin_users"])


@app.on_event("shutdown")
def shutdown_event():
    engine.dispose()
