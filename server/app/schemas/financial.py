from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# -------------------
# Section
# -------------------
class SectionBase(BaseModel):
    title: str
    content: str
    last_updated: Optional[datetime] = None
    reviewed_by: Optional[str] = ""
    region: Optional[str] = "US"
    tags: Optional[List[str]] = []
    download_url: Optional[str] = None   # <-- new

class SectionCreate(SectionBase):
    pass

class SectionUpdate(SectionBase):
    pass

class SectionOut(SectionBase):
    id: int

    class Config:
        orm_mode = True


# -------------------
# Quiz
# -------------------
class QuizQuestionBase(BaseModel):
    question: str
    options: List[str]
    answer: str

class QuizQuestionCreate(QuizQuestionBase):
    pass

class QuizQuestionUpdate(QuizQuestionBase):
    pass

class QuizQuestionOut(QuizQuestionBase):
    id: int

    class Config:
        orm_mode = True


# -------------------
# Module
# -------------------
class FinancialModuleBase(BaseModel):
    title: str
    is_global: bool = False

class FinancialModuleCreate(FinancialModuleBase):
    sections: Optional[List[SectionCreate]] = []
    quiz: Optional[List[QuizQuestionCreate]] = []

class FinancialModuleUpdate(FinancialModuleBase):
    sections: Optional[List[SectionUpdate]] = []
    quiz: Optional[List[QuizQuestionUpdate]] = []

class FinancialModuleOut(FinancialModuleBase):
    id: int
    user_id: Optional[int] = None  # null = global module
    sections: List[SectionOut] = []
    quiz: List[QuizQuestionOut] = []

    class Config:
        orm_mode = True
