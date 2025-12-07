from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.bank_accounts import BankAccount
from app.schemas.bank_accounts import BankAccountCreate, BankAccountOut

router = APIRouter(prefix="/bank-accounts", tags=["Bank Accounts"])

# GET all bank accounts for current user
@router.get("/", response_model=List[BankAccountOut])
def list_bank_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accounts = db.query(BankAccount).filter(BankAccount.user_id == current_user.id).all()
    return accounts

# POST add new bank account
@router.post("/", response_model=BankAccountOut)
def add_bank_account(
    bank: BankAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = BankAccount(
        user_id=current_user.id,
        name=bank.name,
        type=bank.type,
        account_number=bank.account_number,
        balance=bank.balance,
        last_sync=datetime.utcnow()
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

# Sync a single bank account
@router.post("/{account_id}/sync/", response_model=dict)
def sync_bank_account(account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    account = db.query(BankAccount).filter(BankAccount.id == account_id, BankAccount.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    # Example sync logic — replace with real integration later
    account.last_sync = datetime.utcnow()
    db.commit()
    db.refresh(account)

    return {
        "id": account.id,
        "name": account.name,
        "type": account.type,
        "account_number": account.account_number,
        "balance": account.balance,
        "last_sync": account.last_sync
    }


# DELETE bank account
@router.delete("/{account_id}/", status_code=204)
def delete_bank_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(BankAccount).filter(
        BankAccount.id == account_id,
        BankAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    db.delete(account)
    db.commit()
