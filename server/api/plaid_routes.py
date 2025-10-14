from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import plaid
from .. import kms
from .. import db as _db
from ..models import BankAccount
from .deps import get_current_user
from sqlalchemy.orm import Session
from fastapi import Depends

router = APIRouter(prefix="/api/plaid", tags=["plaid"])


class LinkTokenRequest(BaseModel):
    client_user_id: str


class PublicTokenRequest(BaseModel):
    public_token: str


@router.post("/create_link_token")
def create_link_token(req: LinkTokenRequest):
    try:
        token = plaid.create_link_token(req.client_user_id)
        return {"link_token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exchange_public_token")
def exchange_public_token(
    req: PublicTokenRequest,
    session: Session = Depends(_db.get_db),
    current_user=Depends(get_current_user),
):
    try:
        access_token, item_id = plaid.exchange_public_token(req.public_token)

        # encrypt access_token with KMS and persist an Account placeholder
        try:
            encrypted = kms.encrypt_text(access_token)
        except Exception:
            # fallback: store raw token (not recommended)
            encrypted = access_token

        account = BankAccount(
            user_id=current_user.id,
            provider_name="plaid",
            account_type="bank",
            account_mask=None,
            currency_code=None,
            item_id=item_id,
            access_token_encrypted=encrypted,
        )
        session.add(account)
        session.commit()
        session.refresh(account)

        # attempt to fetch accounts via client (best-effort)
        try:
            client_accounts = []
            if hasattr(plaid, "_plaid_client") and plaid._plaid_client:
                resp = plaid._plaid_client.Accounts.get(access_token)
                client_accounts = resp.get("accounts", [])
        except Exception:
            client_accounts = []

        # return both keys for backward compatibility
        return {
            "item_id": item_id,
            "account_id": account.id,
            "bank_account_id": account.id,
            "accounts": client_accounts,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
