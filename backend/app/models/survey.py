"""
Modelos SQLAlchemy — Encuestas y Respuestas.
Encuestas periódicas sobre motivación, economía, carga académica, estado emocional y adaptación.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class SurveyCategory(str, enum.Enum):
    MOTIVACION = "motivacion"
    ECONOMICA = "economica"
    CARGA_ACADEMICA = "carga_academica"
    EMOCIONAL = "emocional"
    ADAPTACION = "adaptacion"


class SurveyTemplate(Base):
    """Plantilla de encuesta definida por el equipo de Bienestar."""
    __tablename__ = "survey_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(SAEnum(SurveyCategory), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    questions = relationship("SurveyQuestion", back_populates="template", cascade="all, delete-orphan")


class SurveyQuestion(Base):
    """Pregunta individual dentro de una encuesta (respuesta escala 1–5)."""
    __tablename__ = "survey_questions"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("survey_templates.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    order = Column(Integer, default=0)
    weight = Column(Integer, default=1)  # Peso para cálculo de riesgo

    template = relationship("SurveyTemplate", back_populates="questions")


class SurveyResponse(Base):
    """Respuesta de un estudiante a una encuesta completa."""
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("survey_templates.id"), nullable=False)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="surveys")
    template = relationship("SurveyTemplate")
    answers = relationship("SurveyAnswer", back_populates="response", cascade="all, delete-orphan")


class SurveyAnswer(Base):
    """Respuesta individual a una pregunta (escala 1–5)."""
    __tablename__ = "survey_answers"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("survey_responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("survey_questions.id"), nullable=False)
    score = Column(Integer, nullable=False)  # 1 a 5

    response = relationship("SurveyResponse", back_populates="answers")
    question = relationship("SurveyQuestion")


# ── Respuestas públicas (portal sin login) ────────────────────────────────────

class PublicSurveyResponse(Base):
    """Respuesta de un visitante anónimo al portal público de evaluación."""
    __tablename__ = "public_survey_responses"

    id = Column(Integer, primary_key=True, index=True)
    # Datos de contacto del respondiente
    full_name = Column(String(200), nullable=False)
    phone = Column(String(30), nullable=False)
    carrera = Column(String(150), nullable=False)
    cedula = Column(String(30), nullable=False)
    # Encuesta respondida
    template_id = Column(Integer, ForeignKey("survey_templates.id"), nullable=False)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    template = relationship("SurveyTemplate")
    answers = relationship("PublicSurveyAnswer", back_populates="response", cascade="all, delete-orphan")


class PublicSurveyAnswer(Base):
    """Respuesta individual (escala 1–5) dentro de una encuesta pública."""
    __tablename__ = "public_survey_answers"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("public_survey_responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("survey_questions.id"), nullable=False)
    score = Column(Integer, nullable=False)  # 1 a 5

    response = relationship("PublicSurveyResponse", back_populates="answers")
    question = relationship("SurveyQuestion")
