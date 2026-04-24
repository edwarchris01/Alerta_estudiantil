"""
Esquemas Pydantic — Riesgo e Intervenciones.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.risk import RiskLevel


class RiskAssessmentOut(BaseModel):
    id: int
    student_id: int
    risk_score: int
    risk_level: RiskLevel
    ml_probability: Optional[float]
    assessment_method: str
    academic_score: int
    economic_score: int
    emotional_score: int
    motivation_score: int
    adaptation_score: int
    notes: Optional[str]
    assessed_at: datetime

    class Config:
        from_attributes = True


class RiskSummary(BaseModel):
    """Resumen de riesgo para el dashboard."""
    student_id: int
    student_code: str
    student_name: str
    program: str
    semester: int
    risk_level: RiskLevel
    risk_score: int
    top_factor: str
    last_assessed: datetime


class InterventionCreate(BaseModel):
    assessment_id: int
    action_type: str
    description: Optional[str] = None


class InterventionOut(BaseModel):
    id: int
    assessment_id: int
    intervener_id: int
    action_type: str
    description: Optional[str]
    outcome: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class InterventionHistoryOut(BaseModel):
    id: int
    assessment_id: int
    intervener_id: int
    intervener_name: str
    action_type: str
    description: Optional[str]
    outcome: Optional[str]
    created_at: datetime
    risk_level: RiskLevel
    risk_score: int
    assessed_at: datetime


# ── Dashboard ──
class DashboardStats(BaseModel):
    total_students: int
    students_at_risk: int
    risk_distribution: dict  # {"bajo": N, "medio": N, "alto": N, "critico": N}
    top_risk_factors: List[dict]
    risk_by_program: List[dict]
    risk_by_semester: List[dict]
    recent_alerts: List[RiskSummary]
