from app.db.session import SessionLocal

# -----------------------------
# FastAPI Dependency
# -----------------------------


def get_db():
    """
    Database session dependency.
    Ensures session cleanup after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
