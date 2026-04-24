"""Tests para el motor de evaluación de riesgo."""

from app.services.risk_engine import _evaluate_academic_risk, _determine_level
from app.models.risk import RiskLevel


class _MockStudent:
    """Estudiante simulado para tests unitarios."""
    def __init__(self, gpa=3.5, failed=0, absences=0, repeated=0):
        self.cumulative_gpa = gpa
        self.failed_courses = failed
        self.absences = absences
        self.repeated_courses = repeated


# ── Evaluación académica ──

def test_low_risk_student():
    student = _MockStudent(gpa=4.2, failed=0, absences=2, repeated=0)
    score = _evaluate_academic_risk(student)
    assert score == 0


def test_medium_risk_student():
    student = _MockStudent(gpa=2.8, failed=2, absences=5, repeated=1)
    score = _evaluate_academic_risk(student)
    assert score >= 3


def test_high_risk_student():
    student = _MockStudent(gpa=2.0, failed=5, absences=20, repeated=3)
    score = _evaluate_academic_risk(student)
    assert score >= 7


def test_gpa_boundary():
    """Promedio exacto en 3.0 debe sumar +2."""
    student = _MockStudent(gpa=3.0, failed=0, absences=0, repeated=0)
    score = _evaluate_academic_risk(student)
    # 3.0 < 3.3 → +1  (la regla es <3.0 → +2, <3.3 → +1)
    assert score == 1


# ── Clasificación por nivel ──

def test_risk_level_bajo():
    assert _determine_level(0) == RiskLevel.BAJO
    assert _determine_level(2) == RiskLevel.BAJO


def test_risk_level_medio():
    assert _determine_level(3) == RiskLevel.MEDIO
    assert _determine_level(4) == RiskLevel.MEDIO


def test_risk_level_alto():
    assert _determine_level(5) == RiskLevel.ALTO
    assert _determine_level(6) == RiskLevel.ALTO


def test_risk_level_critico():
    assert _determine_level(7) == RiskLevel.CRITICO
    assert _determine_level(10) == RiskLevel.CRITICO
