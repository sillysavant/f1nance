from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


# -----------------------------
# SQLAlchemy Engine & Session
# -----------------------------
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.is_development(),  # Show SQL in dev mode
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
