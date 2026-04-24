"""
Rutas de Encuestas — Plantillas y respuestas de estudiantes.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.survey import (
    TemplateCreate,
    TemplateUpdate,
    TemplateOut,
    SurveyResponseCreate,
    SurveyResponseOut,
    PublicSurveyResponseCreate,
)
from app.services import survey_service, student_service
from app.api.deps import get_current_active_user, require_staff
from app.models.user import User

router = APIRouter(prefix="/surveys", tags=["Encuestas"])


@router.post("/templates", response_model=TemplateOut, summary="Crear plantilla de encuesta")
def create_template(
    data: TemplateCreate,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return survey_service.create_template(db, data)


@router.patch("/templates/{template_id}", response_model=TemplateOut, summary="Actualizar plantilla")
def update_template(
    template_id: int,
    data: TemplateUpdate,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return survey_service.update_template(db, template_id, data)


@router.delete("/templates/{template_id}", response_model=TemplateOut, summary="Archivar plantilla")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return survey_service.archive_template(db, template_id)


@router.get("/templates", response_model=List[TemplateOut], summary="Listar plantillas activas")
def list_templates(
    db: Session = Depends(get_db),
):
    """Público: no requiere token para que el portal externo pueda cargar encuestas."""
    return survey_service.list_templates(db)


@router.get("/templates/{template_id}", response_model=TemplateOut, summary="Obtener plantilla")
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_active_user),
):
    return survey_service.get_template(db, template_id)


@router.post("/respond", response_model=SurveyResponseOut, summary="Responder encuesta")
def submit_response(
    data: SurveyResponseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    student = student_service.get_student_by_user_id(db, user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Perfil de estudiante no encontrado")
    return survey_service.submit_survey(db, student.id, data)


@router.get("/my-responses", response_model=List[SurveyResponseOut], summary="Mis respuestas")
def my_responses(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    student = student_service.get_student_by_user_id(db, user.id)
    if not student:
        return []
    return survey_service.get_student_responses(db, student.id)


@router.get(
    "/student/{student_id}/responses",
    response_model=List[SurveyResponseOut],
    summary="Respuestas de estudiante (staff)",
)
def student_responses(
    student_id: int,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return survey_service.get_student_responses(db, student_id)


@router.post(
    "/respond-public",
    response_model=SurveyResponseOut,
    summary="Responder encuesta desde portal público (sin login)",
)
def submit_public_response(
    data: PublicSurveyResponseCreate,
    db: Session = Depends(get_db),
):
    return survey_service.submit_public_survey(db, data)
