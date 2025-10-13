from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import os

# Prefer a server-local .env file to avoid leaking secrets to the client build.
root = Path(__file__).resolve().parents[1]
server_env = root / "server" / ".env"
repo_env = root / ".env"
if server_env.exists():
    load_dotenv(server_env)
elif repo_env.exists():
    load_dotenv(repo_env)

from .api import plaid_routes, auth_routes
from . import db, auth
from .models import User
from .create_tables import create_all


app = FastAPI()


@app.on_event("startup")
def startup_event():
    # create DB tables if they don't exist (dev only)
    try:
        create_all()
    except Exception:
        pass


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/")
def health_check():
    return {"status": "ok"}


app.include_router(plaid_routes.router)
app.include_router(auth_routes.router)
