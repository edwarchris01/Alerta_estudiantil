"""
Rutas de Evaluación de Riesgo y Dashboard institucional.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.risk import (
    RiskAssessmentOut,
    DashboardStats,
    InterventionCreate,
    InterventionOut,
    InterventionHistoryOut,
)
from app.services import risk_engine, student_service, dashboard_service
from app.api.deps import require_staff, get_current_active_user
from app.models.user import User
from app.models.risk import Intervention, RiskAssessment

router = APIRouter(prefix="/risk", tags=["Riesgo y Dashboard"])


@router.get(
    "/me",
    response_model=Optional[RiskAssessmentOut],
    summary="Última evaluación de riesgo del estudiante autenticado",
)
def get_my_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    student = student_service.get_student_by_user_id(db, current_user.id)
    if not student:
        return None
    assessment = risk_engine.get_latest_assessment(db, student.id)
    if not assessment:
        return None
    return assessment


@router.post(
    "/me/assess",
    response_model=RiskAssessmentOut,
    summary="El estudiante autenticado solicita recalcular su propio riesgo",
)
def assess_myself(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    student = student_service.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Perfil de estudiante no encontrado")
    return risk_engine.assess_student_risk(db, student)


@router.post(
    "/assess/{student_id}",
    response_model=RiskAssessmentOut,
    summary="Evaluar riesgo de un estudiante",
)
def assess_student(
    student_id: int,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    student = student_service.get_student(db, student_id)
    return risk_engine.assess_student_risk(db, student)


@router.post(
    "/assess-all",
    response_model=List[RiskAssessmentOut],
    summary="Evaluar riesgo de todos los estudiantes",
)
def assess_all(
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return risk_engine.assess_all_students(db)


@router.get(
    "/student/{student_id}",
    response_model=RiskAssessmentOut,
    summary="Última evaluación de riesgo de estudiante",
)
def get_latest(
    student_id: int,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    assessment = risk_engine.get_latest_assessment(db, student_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Sin evaluaciones de riesgo")
    return assessment


@router.get("/dashboard", response_model=DashboardStats, summary="Dashboard institucional")
def dashboard(
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return dashboard_service.get_dashboard_stats(db)


@router.post(
    "/interventions",
    response_model=InterventionOut,
    summary="Registrar intervención sobre alerta",
)
def create_intervention(
    data: InterventionCreate,
    db: Session = Depends(get_db),
    staff: User = Depends(require_staff),
):
    assessment = db.query(RiskAssessment).filter(RiskAssessment.id == data.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Evaluación de riesgo no encontrada")

    intervention = Intervention(
        assessment_id=data.assessment_id,
        intervener_id=staff.id,
        action_type=data.action_type,
        description=data.description,
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return intervention


@router.get(
    "/interventions/student/{student_id}",
    response_model=List[InterventionHistoryOut],
    summary="Historial de intervenciones de un estudiante",
)
def list_student_interventions(
    student_id: int,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    student_service.get_student(db, student_id)

    rows = (
        db.query(Intervention, RiskAssessment, User)
        .join(RiskAssessment, Intervention.assessment_id == RiskAssessment.id)
        .join(User, Intervention.intervener_id == User.id)
        .filter(RiskAssessment.student_id == student_id)
        .order_by(Intervention.created_at.desc())
        .all()
    )

    return [
        InterventionHistoryOut(
            id=intervention.id,
            assessment_id=assessment.id,
            intervener_id=intervener.id,
            intervener_name=intervener.full_name,
            action_type=intervention.action_type,
            description=intervention.description,
            outcome=intervention.outcome,
            created_at=intervention.created_at,
            risk_level=assessment.risk_level,
            risk_score=assessment.risk_score,
            assessed_at=assessment.assessed_at,
        )
        for intervention, assessment, intervener in rows
    ]
