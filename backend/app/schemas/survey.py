"""
Esquemas Pydantic — Encuestas.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.survey import SurveyCategory


# ── Templates ──
class QuestionCreate(BaseModel):
    question_text: str
    order: int = 0
    weight: int = 1


class TemplateCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: SurveyCategory
    questions: List[QuestionCreate] = []


class TemplateUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[SurveyCategory] = None
    is_active: Optional[bool] = None
    questions: Optional[List[QuestionCreate]] = None


class QuestionOut(BaseModel):
    id: int
    question_text: str
    order: int
    weight: int

    class Config:
        from_attributes = True


class TemplateOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: SurveyCategory
    is_active: bool
    questions: List[QuestionOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ── Responses ──
class AnswerCreate(BaseModel):
    question_id: int
    score: int = Field(..., ge=1, le=5)


class SurveyResponseCreate(BaseModel):
    template_id: int
    answers: List[AnswerCreate]


class AnswerOut(BaseModel):
    id: int
    question_id: int
    score: int

    class Config:
        from_attributes = True


class SurveyResponseOut(BaseModel):
    id: int
    student_id: int
    template_id: int
    completed_at: datetime
    answers: List[AnswerOut] = []

    class Config:
        from_attributes = True


# ── Encuesta pública (sin login) ──

class PublicSurveyResponseCreate(BaseModel):
    student_id: int
    template_id: int
    answers: List[AnswerCreate]


class PublicSurveyResponseOut(BaseModel):
    id: int
    student_id: int
    template_id: int
    completed_at: datetime
    answers: List[AnswerOut] = []

    class Config:
        from_attributes = True
