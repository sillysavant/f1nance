from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base

class FinancialModule(Base):
    __tablename__ = "financial_modules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)

    user = relationship("User", back_populates="financial_modules")
    sections = relationship("Section", back_populates="module", cascade="all, delete-orphan")
    quiz = relationship("QuizQuestion", back_populates="module", cascade="all, delete-orphan")


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("financial_modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(String, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow)
    reviewed_by = Column(String(255), nullable=True)
    region = Column(String(50), default="US")
    tags = Column(String, default="")  # comma-separated
    download_url = Column(String(1024), nullable=True) 

    module = relationship("FinancialModule", back_populates="sections")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("financial_modules.id"), nullable=False)
    question = Column(String, nullable=False)
    options = Column(String, nullable=False)  # comma-separated options
    answer = Column(String, nullable=False)

    module = relationship("FinancialModule", back_populates="quiz")
