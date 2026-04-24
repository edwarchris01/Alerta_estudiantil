"""
Modelos SQLAlchemy — Evaluación de Riesgo.
Sistema de clasificación basado en reglas (Fase 1) y predicción ML (Fase 2).
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, Float, String, DateTime, ForeignKey, Text, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class RiskLevel(str, enum.Enum):
    BAJO = "bajo"
    MEDIO = "medio"
    ALTO = "alto"
    CRITICO = "critico"


class RiskAssessment(Base):
    """Evaluación de riesgo de deserción para un estudiante."""
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    risk_score = Column(Integer, nullable=False)          # Puntaje total de riesgo
    risk_level = Column(SAEnum(RiskLevel), nullable=False)
    ml_probability = Column(Float, nullable=True)          # Probabilidad ML (Fase 2, 0-100)
    assessment_method = Column(String(50), default="rules")  # "rules" | "ml_v1" | "ml_v2"

    # ── Factores desglosados ──
    academic_score = Column(Integer, default=0)
    economic_score = Column(Integer, default=0)
    emotional_score = Column(Integer, default=0)
    motivation_score = Column(Integer, default=0)
    adaptation_score = Column(Integer, default=0)

    notes = Column(Text, nullable=True)
    assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # ── Relaciones ──
    student = relationship("Student", back_populates="risk_assessments")
    interventions = relationship("Intervention", back_populates="assessment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RiskAssessment student={self.student_id} level={self.risk_level} score={self.risk_score}>"


class Intervention(Base):
    """Registro de intervenciones realizadas sobre alertas de riesgo."""
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("risk_assessments.id"), nullable=False)
    intervener_id = Column(Integer, ForeignKey("users.id"), nullable=False)   # Quién interviene
    action_type = Column(String(100), nullable=False)     # "llamada", "tutoría", "remisión_psicología", etc.
    description = Column(Text, nullable=True)
    outcome = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessment = relationship("RiskAssessment", back_populates="interventions")
    intervener = relationship("User")
