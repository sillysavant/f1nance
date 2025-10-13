import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from server/.env first, then fallback to repo root .env
root = Path(__file__).resolve().parents[1]
server_env = root / "server" / ".env"
repo_env = root / ".env"
if server_env.exists():
    load_dotenv(server_env)
elif repo_env.exists():
    load_dotenv(repo_env)

raw = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/f1nance")
# SQLAlchemy expects postgresql:// scheme; allow postgres:// from env and normalize
if raw.startswith("postgres://"):
    DATABASE_URL = raw.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = raw

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
