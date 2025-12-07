from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from sqlalchemy import or_

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.financial import FinancialModule, Section, QuizQuestion
from app.schemas.financial import FinancialModuleCreate, FinancialModuleUpdate

router = APIRouter(prefix="/financial-modules", tags=["Financial Modules"])

# -------------------
# Helpers to convert DB objects to frontend-friendly dicts
# -------------------
def section_to_out(section: Section):
    return {
        "id": section.id,
        "title": section.title,
        "content": section.content,
        "lastUpdated": section.last_updated.isoformat() if section.last_updated else None,
        "reviewedBy": section.reviewed_by or "",
        "region": section.region,
        "tags": section.tags.split(",") if section.tags else [],
        "downloadUrl": section.download_url  # <-- add this

    }

def quiz_to_out(quiz: QuizQuestion):
    return {
        "id": quiz.id,
        "moduleId": quiz.module_id,
        "sectionId": getattr(quiz, "section_id", None),  # include if sections are needed
        "question": quiz.question,
        "options": quiz.options.split(",") if quiz.options else [],
        "answer": quiz.answer
    }

def module_to_out(module: FinancialModule):
    return {
        "id": module.id,
        "user_id": module.user_id,
        "title": module.title,
        "sections": [section_to_out(s) for s in module.sections],
        "quiz": [quiz_to_out(q) for q in module.quiz]
    }

# -------------------
# List Modules
# -------------------
@router.get("/", response_model=List[dict])
def list_modules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    modules = db.query(FinancialModule).filter(
    or_(FinancialModule.user_id == current_user.id, FinancialModule.user_id == None)
    ).all()
    return [module_to_out(m) for m in modules]

# -------------------
# Create Module
# -------------------
@router.post("/", response_model=dict)
def create_module(module_in: FinancialModuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    module = FinancialModule(title=module_in.title, user_id=None)
    db.add(module)
    db.commit()
    db.refresh(module)

    # Add sections
    for s in module_in.sections or []:
        section = Section(
            module_id=module.id,
            title=s.title,
            content=s.content,
            last_updated=s.last_updated or datetime.utcnow(),
            reviewed_by=s.reviewed_by,
            region=s.region,
            tags=",".join(s.tags)
        )
        db.add(section)

    # Add quiz
    for q in module_in.quiz or []:
        quiz = QuizQuestion(
            module_id=module.id,
            question=q.question,
            options=",".join(q.options),
            answer=q.answer
        )
        db.add(quiz)

    db.commit()
    db.refresh(module)
    return module_to_out(module)

# -------------------
# Update Module
# -------------------
@router.put("/{module_id}/", response_model=dict)
def update_module(module_id: int, module_in: FinancialModuleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    module = db.query(FinancialModule).filter(FinancialModule.id == module_id, FinancialModule.user_id == current_user.id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    module.title = module_in.title

    # Delete all sections and quizzes for a simple overwrite
    db.query(Section).filter(Section.module_id == module.id).delete()
    db.query(QuizQuestion).filter(QuizQuestion.module_id == module.id).delete()

    for s in module_in.sections or []:
        section = Section(
            module_id=module.id,
            title=s.title,
            content=s.content,
            last_updated=s.last_updated or datetime.utcnow(),
            reviewed_by=s.reviewed_by,
            region=s.region,
            tags=",".join(s.tags)
        )
        db.add(section)

    for q in module_in.quiz or []:
        quiz = QuizQuestion(
            module_id=module.id,
            question=q.question,
            options=",".join(q.options),
            answer=q.answer
        )
        db.add(quiz)

    db.commit()
    db.refresh(module)
    return module_to_out(module)

# -------------------
# Delete Module
# -------------------
@router.delete("/{module_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(module_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    module = db.query(FinancialModule).filter(FinancialModule.id == module_id, FinancialModule.user_id == current_user.id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()
    return {"detail": "Module deleted successfully"}
