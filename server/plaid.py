import os
from typing import Tuple

from dotenv import load_dotenv
from pathlib import Path

# Load server-local .env first if present, otherwise fallback to repo root .env
root = Path(__file__).resolve().parents[1]
server_env = root / "server" / ".env"
repo_env = root / ".env"
if server_env.exists():
    load_dotenv(server_env)
elif repo_env.exists():
    load_dotenv(repo_env)

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")

try:
    # import lazily so dependencies are optional for now
    from plaid import Client

    _plaid_client = Client(client_id=PLAID_CLIENT_ID, secret=PLAID_SECRET, environment=PLAID_ENV)
except Exception:
    _plaid_client = None


def create_link_token(client_user_id: str) -> str:
    if _plaid_client is None:
        raise RuntimeError("Plaid client not available; install plaid-python and set PLAID_* env vars")

    resp = _plaid_client.LinkToken.create({
        "user": {"client_user_id": client_user_id},
        "client_name": "F1nance",
        "products": ["transactions"],
        "country_codes": ["US"],
        "language": "en",
    })
    return resp.get("link_token")


def exchange_public_token(public_token: str) -> Tuple[str, str]:
    if _plaid_client is None:
        raise RuntimeError("Plaid client not available; install plaid-python and set PLAID_* env vars")

    resp = _plaid_client.Item.public_token.exchange(public_token)
    return resp.get("access_token"), resp.get("item_id")
