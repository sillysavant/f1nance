from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.income import Income
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeOut
from datetime import datetime

router = APIRouter(prefix="/income", tags=["Income"])

# -------------------
# List incomes
# -------------------
@router.get("/", response_model=List[IncomeOut])
def list_incomes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
    return incomes

# -------------------
# Create income
# -------------------
@router.post("/", response_model=IncomeOut)
def create_income(income_in: IncomeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = Income(
        user_id=current_user.id,
        amount=income_in.amount,
        description=income_in.description,
        date=income_in.date or datetime.utcnow()
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

# -------------------
# Update income
# -------------------
@router.put("/{income_id}/", response_model=IncomeOut)
def update_income(income_id: int, income_in: IncomeUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    for field, value in income_in.dict(exclude_unset=True).items():
        setattr(income, field, value)
    
    db.commit()
    db.refresh(income)
    return income

# -------------------
# Delete income
# -------------------
@router.delete("/{income_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(income_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()
    return {"detail": "Income deleted successfully"}
