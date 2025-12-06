from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.expenses import Expense
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate, ExpenseOut
from datetime import datetime

router = APIRouter(prefix="/expenses", tags=["Expenses"])

# -------------------
# List expenses
# -------------------
@router.get("/", response_model=List[ExpenseOut])
def list_expenses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    return expenses

# -------------------
# Create expense
# -------------------
@router.post("/", response_model=ExpenseOut)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = Expense(
        user_id=current_user.id,
        category=expense_in.category,
        amount=expense_in.amount,
        description=expense_in.description,
        date=expense_in.date or datetime.utcnow()
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

# -------------------
# Update expense
# -------------------
@router.put("/{expense_id}/", response_model=ExpenseOut)
def update_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for field, value in expense_in.dict(exclude_unset=True).items():
        setattr(expense, field, value)
    
    db.commit()
    db.refresh(expense)
    return expense

# -------------------
# Delete expense
# -------------------
@router.delete("/{expense_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"detail": "Expense deleted successfully"}
