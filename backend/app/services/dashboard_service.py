"""
Servicio del Dashboard — Métricas institucionales.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.student import Student
from app.models.risk import RiskAssessment, RiskLevel
from app.models.user import User
from app.schemas.risk import DashboardStats, RiskSummary


def get_dashboard_stats(db: Session) -> DashboardStats:
    """Genera estadísticas completas para el dashboard institucional."""

    # Total de estudiantes activos
    total_students = db.query(func.count(Student.id)).filter(Student.is_active == True).scalar()

    # ── Obtener última evaluación por estudiante (subquery) ──
    latest_sub = (
        db.query(
            RiskAssessment.student_id,
            func.max(RiskAssessment.assessed_at).label("latest_at"),
        )
        .group_by(RiskAssessment.student_id)
        .subquery()
    )

    # JOIN con Student y User en una sola consulta — elimina el N+1
    rows = (
        db.query(RiskAssessment, Student, User)
        .join(
            latest_sub,
            (RiskAssessment.student_id == latest_sub.c.student_id)
            & (RiskAssessment.assessed_at == latest_sub.c.latest_at),
        )
        .join(Student, RiskAssessment.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .all()
    )

    # ── Distribución de riesgo ──
    distribution = {"bajo": 0, "medio": 0, "alto": 0, "critico": 0}
    for a, _s, _u in rows:
        distribution[a.risk_level.value] = distribution.get(a.risk_level.value, 0) + 1

    students_at_risk = distribution["medio"] + distribution["alto"] + distribution["critico"]

    # ── Factores de riesgo más frecuentes ──
    factor_totals = {
        "Académico": sum(a.academic_score for a, _, __ in rows),
        "Económico": sum(a.economic_score for a, _, __ in rows),
        "Emocional": sum(a.emotional_score for a, _, __ in rows),
        "Motivación": sum(a.motivation_score for a, _, __ in rows),
        "Adaptación": sum(a.adaptation_score for a, _, __ in rows),
    }
    top_factors = sorted(
        [{"factor": k, "total_score": v} for k, v in factor_totals.items()],
        key=lambda x: x["total_score"],
        reverse=True,
    )

    # ── Riesgo por programa ──
    risk_by_program = {}
    for a, student, _u in rows:
        prog = student.program
        if prog not in risk_by_program:
            risk_by_program[prog] = {"program": prog, "total": 0, "at_risk": 0}
        risk_by_program[prog]["total"] += 1
        if a.risk_level in (RiskLevel.MEDIO, RiskLevel.ALTO, RiskLevel.CRITICO):
            risk_by_program[prog]["at_risk"] += 1

    for prog in risk_by_program.values():
        prog["risk_percentage"] = round(
            (prog["at_risk"] / prog["total"] * 100) if prog["total"] > 0 else 0, 1
        )

    # ── Riesgo por semestre ──
    risk_by_semester = {}
    for a, student, _u in rows:
        sem = student.semester
        if sem not in risk_by_semester:
            risk_by_semester[sem] = {"semester": sem, "total": 0, "at_risk": 0}
        risk_by_semester[sem]["total"] += 1
        if a.risk_level in (RiskLevel.MEDIO, RiskLevel.ALTO, RiskLevel.CRITICO):
            risk_by_semester[sem]["at_risk"] += 1

    for sem in risk_by_semester.values():
        sem["risk_percentage"] = round(
            (sem["at_risk"] / sem["total"] * 100) if sem["total"] > 0 else 0, 1
        )

    # ── Alertas recientes (alto y crítico) ──
    recent_alerts = []
    high_risk = [(a, s, u) for a, s, u in rows if a.risk_level in (RiskLevel.ALTO, RiskLevel.CRITICO)]
    high_risk.sort(key=lambda x: x[0].risk_score, reverse=True)

    for a, student, user in high_risk[:20]:
        factors = {
            "Académico": a.academic_score,
            "Económico": a.economic_score,
            "Emocional": a.emotional_score,
            "Motivación": a.motivation_score,
            "Adaptación": a.adaptation_score,
        }
        top_factor = max(factors, key=factors.get) if any(factors.values()) else "N/A"

        recent_alerts.append(RiskSummary(
            student_id=student.id,
            student_code=student.student_code,
            student_name=user.full_name,
            program=student.program,
            semester=student.semester,
            risk_level=a.risk_level,
            risk_score=a.risk_score,
            top_factor=top_factor,
            last_assessed=a.assessed_at,
        ))

    return DashboardStats(
        total_students=total_students,
        students_at_risk=students_at_risk,
        risk_distribution=distribution,
        top_risk_factors=top_factors,
        risk_by_program=sorted(risk_by_program.values(), key=lambda x: x["risk_percentage"], reverse=True),
        risk_by_semester=sorted(risk_by_semester.values(), key=lambda x: x["semester"]),
        recent_alerts=recent_alerts,
    )
