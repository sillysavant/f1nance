from fastapi import FastAPI
from app.api.v1.routes import auth

from app.core.config import settings
from app.db.session import engine
from app.models import base

base.Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])


@app.on_event("shutdown")
def shutdown_event():
    engine.dispose()
