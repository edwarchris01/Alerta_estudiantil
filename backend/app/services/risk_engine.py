"""
Motor de Evaluación de Riesgo — Fase 1 (Reglas).

Sistema de clasificación basado en reglas ponderadas.
Cada factor suma puntos de riesgo. El total determina el nivel.

Escala de riesgo:
  0–2  → Bajo
  3–4  → Medio
  5–6  → Alto
  7+   → Crítico
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.survey import SurveyResponse, SurveyAnswer, SurveyCategory
from app.models.risk import RiskAssessment, RiskLevel


# ═══════════════════════════════════════════════════════
#  REGLAS DE RIESGO ACADÉMICO
# ═══════════════════════════════════════════════════════

def _evaluate_academic_risk(student: Student) -> int:
    """Evalúa factores académicos del estudiante."""
    score = 0

    # Promedio acumulado
    if student.cumulative_gpa < 2.5:
        score += 3
    elif student.cumulative_gpa < 3.0:
        score += 2
    elif student.cumulative_gpa < 3.3:
        score += 1

    # Materias perdidas
    if student.failed_courses >= 4:
        score += 3
    elif student.failed_courses >= 2:
        score += 2
    elif student.failed_courses >= 1:
        score += 1

    # Inasistencias
    if student.absences >= 15:
        score += 2
    elif student.absences >= 8:
        score += 1

    # Materias repetidas
    if student.repeated_courses >= 3:
        score += 2
    elif student.repeated_courses >= 1:
        score += 1

    return score


# ═══════════════════════════════════════════════════════
#  REGLAS DE RIESGO POR ENCUESTA
# ═══════════════════════════════════════════════════════

def _get_category_avg(db: Session, student_id: int, category: SurveyCategory) -> Optional[float]:
    """Obtiene el promedio de la última encuesta respondida en una categoría."""
    latest = (
        db.query(SurveyResponse)
        .filter(
            SurveyResponse.student_id == student_id,
            SurveyResponse.template.has(category=category),
        )
        .order_by(SurveyResponse.completed_at.desc())
        .first()
    )
    if not latest or not latest.answers:
        return None

    scores = [a.score for a in latest.answers]
    return sum(scores) / len(scores)


def _evaluate_survey_risk(db: Session, student_id: int) -> dict:
    """Evalúa riesgo por cada categoría de encuesta."""
    results = {
        "economic_score": 0,
        "emotional_score": 0,
        "motivation_score": 0,
        "adaptation_score": 0,
    }

    category_map = {
        SurveyCategory.ECONOMICA: "economic_score",
        SurveyCategory.EMOCIONAL: "emotional_score",
        SurveyCategory.MOTIVACION: "motivation_score",
        SurveyCategory.ADAPTACION: "adaptation_score",
    }

    for category, key in category_map.items():
        avg = _get_category_avg(db, student_id, category)
        if avg is not None:
            # Escala invertida: 1-5 donde 1 es peor
            # avg <= 2.0 → alto riesgo (+2)
            # avg <= 3.0 → riesgo medio (+1)
            if avg <= 2.0:
                results[key] = 2
            elif avg <= 3.0:
                results[key] = 1

    # Carga académica se evalúa diferente (puede sentirse sobrecargado)
    carga_avg = _get_category_avg(db, student_id, SurveyCategory.CARGA_ACADEMICA)
    if carga_avg is not None and carga_avg <= 2.0:
        results["motivation_score"] += 1  # Sobrecarga impacta motivación

    return results


# ═══════════════════════════════════════════════════════
#  CLASIFICACIÓN FINAL
# ═══════════════════════════════════════════════════════

def _determine_level(total_score: int) -> RiskLevel:
    """Determina el nivel de riesgo según el puntaje total."""
    if total_score >= 7:
        return RiskLevel.CRITICO
    elif total_score >= 5:
        return RiskLevel.ALTO
    elif total_score >= 3:
        return RiskLevel.MEDIO
    return RiskLevel.BAJO


def _determine_top_factor(assessment: dict) -> str:
    """Identifica el factor de riesgo principal."""
    factors = {
        "Académico": assessment.get("academic_score", 0),
        "Económico": assessment.get("economic_score", 0),
        "Emocional": assessment.get("emotional_score", 0),
        "Motivación": assessment.get("motivation_score", 0),
        "Adaptación": assessment.get("adaptation_score", 0),
    }
    return max(factors, key=factors.get) if any(factors.values()) else "Ninguno"


# ═══════════════════════════════════════════════════════
#  API PÚBLICA DEL MOTOR
# ═══════════════════════════════════════════════════════

def assess_student_risk(db: Session, student: Student) -> RiskAssessment:
    """
    Evalúa el riesgo de deserción de un estudiante usando el motor de reglas.
    Crea un nuevo registro de RiskAssessment en la base de datos.
    """
    academic_score = _evaluate_academic_risk(student)
    survey_scores = _evaluate_survey_risk(db, student.id)

    total_score = academic_score + sum(survey_scores.values())
    risk_level = _determine_level(total_score)

    assessment = RiskAssessment(
        student_id=student.id,
        risk_score=total_score,
        risk_level=risk_level,
        assessment_method="rules",
        academic_score=academic_score,
        **survey_scores,
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def assess_all_students(db: Session) -> list:
    """Evalúa el riesgo de todos los estudiantes activos."""
    students = db.query(Student).filter(Student.is_active == True).all()
    results = []
    for student in students:
        assessment = assess_student_risk(db, student)
        results.append(assessment)
    return results


def get_latest_assessment(db: Session, student_id: int) -> Optional[RiskAssessment]:
    """Obtiene la evaluación de riesgo más reciente de un estudiante."""
    return (
        db.query(RiskAssessment)
        .filter(RiskAssessment.student_id == student_id)
        .order_by(RiskAssessment.assessed_at.desc())
        .first()
    )
