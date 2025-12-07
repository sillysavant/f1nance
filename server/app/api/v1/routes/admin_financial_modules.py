# app/api/v1/routes/admin_financial_modules.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.financial import FinancialModule, Section, QuizQuestion
from app.models.users import User
from app.schemas.financial import FinancialModuleCreate, FinancialModuleUpdate
from app.core.decorators.handle_exceptions import handle_exceptions

router = APIRouter(prefix="/admin/financial-modules", tags=["Admin Financial Modules"])


# -----------------------
# Helper: Convert DB model to output dict
# -----------------------
def module_to_out(module: FinancialModule):
    def section_to_out(s: Section):
        return {
            "id": s.id,
            "title": s.title,
            "content": s.content,
            "lastUpdated": s.last_updated.isoformat() if s.last_updated else None,
            "reviewedBy": s.reviewed_by or "",
            "region": s.region,
            "tags": s.tags.split(",") if s.tags else [],
            "download_url": getattr(s, "download_url", None)
        }

    def quiz_to_out(q: QuizQuestion):
        return {
            "id": q.id,
            "moduleId": q.module_id,
            "question": q.question,
            "options": q.options.split(",") if q.options else [],
            "answer": q.answer
        }

    return {
        "id": module.id,
        "user_id": module.user_id,  # will be None for global modules
        "title": module.title,
        "sections": [section_to_out(s) for s in module.sections],
        "quiz": [quiz_to_out(q) for q in module.quiz]
    }


# -----------------------
# Admin check
# -----------------------
def ensure_admin(user: User):
    if not user or not getattr(user, "is_superuser", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin permissions required")


# -----------------------
# GET: List modules
# -----------------------
@router.get("/", response_model=List[dict])
@handle_exceptions
def admin_list_modules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_admin(current_user)
    # Return all modules, global (user_id=None) + user-specific if needed
    modules = db.query(FinancialModule).all()
    return [module_to_out(m) for m in modules]


# -----------------------
# POST: Create module (global by default)
# -----------------------
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
@handle_exceptions
def admin_create_module(
    module_in: FinancialModuleCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_admin(current_user)

    # Global module: user_id=None
    module = FinancialModule(title=module_in.title, user_id=None)
    db.add(module)
    db.commit()
    db.refresh(module)

    # Create sections
    for s in module_in.sections or []:
        section = Section(
            module_id=module.id,
            title=s.title,
            content=s.content,
            last_updated=s.last_updated or datetime.utcnow(),
            reviewed_by=s.reviewed_by,
            region=s.region,
            tags=",".join(s.tags or []),
            download_url=getattr(s, "download_url", None)
        )
        db.add(section)

    # Create quiz questions
    for q in module_in.quiz or []:
        quiz = QuizQuestion(
            module_id=module.id,
            question=q.question,
            options=",".join(q.options or []),
            answer=q.answer
        )
        db.add(quiz)

    db.commit()
    db.refresh(module)
    return module_to_out(module)


# -----------------------
# PUT: Update module
# -----------------------
@router.put("/{module_id}/", response_model=dict)
@handle_exceptions
def admin_update_module(
    module_id: int,
    module_in: FinancialModuleUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_admin(current_user)

    module = db.query(FinancialModule).filter(FinancialModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    module.title = module_in.title

    # Delete old sections and quizzes
    db.query(Section).filter(Section.module_id == module.id).delete()
    db.query(QuizQuestion).filter(QuizQuestion.module_id == module.id).delete()

    # Add updated sections
    for s in module_in.sections or []:
        section = Section(
            module_id=module.id,
            title=s.title,
            content=s.content,
            last_updated=s.last_updated or datetime.utcnow(),
            reviewed_by=s.reviewed_by,
            region=s.region,
            tags=",".join(s.tags or []),
            download_url=getattr(s, "download_url", None)
        )
        db.add(section)

    # Add updated quiz
    for q in module_in.quiz or []:
        quiz = QuizQuestion(
            module_id=module.id,
            question=q.question,
            options=",".join(q.options or []),
            answer=q.answer
        )
        db.add(quiz)

    db.commit()
    db.refresh(module)
    return module_to_out(module)


# -----------------------
# DELETE: Delete module
# -----------------------
@router.delete("/{module_id}/", status_code=status.HTTP_204_NO_CONTENT)
@handle_exceptions
def admin_delete_module(module_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_admin(current_user)

    module = db.query(FinancialModule).filter(FinancialModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    db.delete(module)
    db.commit()
    return {"detail": "Deleted"}
