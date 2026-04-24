"""
Servicio de encuestas — CRUD de plantillas y recolección de respuestas.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.survey import (
    SurveyTemplate,
    SurveyQuestion,
    SurveyResponse,
    SurveyAnswer,
    PublicSurveyResponse,
    PublicSurveyAnswer,
)
from app.schemas.survey import (
    TemplateCreate,
    TemplateUpdate,
    SurveyResponseCreate,
    PublicSurveyResponseCreate,
)


def create_template(db: Session, data: TemplateCreate) -> SurveyTemplate:
    template = SurveyTemplate(
        title=data.title,
        description=data.description,
        category=data.category,
    )
    db.add(template)
    db.flush()

    for q in data.questions:
        question = SurveyQuestion(
            template_id=template.id,
            question_text=q.question_text,
            order=q.order,
            weight=q.weight,
        )
        db.add(question)

    db.commit()
    db.refresh(template)
    return template


def update_template(db: Session, template_id: int, data: TemplateUpdate) -> SurveyTemplate:
    template = get_template(db, template_id)
    update_data = data.model_dump(exclude_unset=True)
    questions = update_data.pop("questions", None)

    for key, value in update_data.items():
        setattr(template, key, value)

    if questions is not None:
        template.questions.clear()
        db.flush()
        for question in questions:
            question_text = question["question_text"] if isinstance(question, dict) else question.question_text
            order = question.get("order", 0) if isinstance(question, dict) else question.order
            weight = question.get("weight", 1) if isinstance(question, dict) else question.weight
            db.add(
                SurveyQuestion(
                    template_id=template.id,
                    question_text=question_text,
                    order=order,
                    weight=weight,
                )
            )

    db.commit()
    db.refresh(template)
    return template


def archive_template(db: Session, template_id: int) -> SurveyTemplate:
    template = get_template(db, template_id)
    template.is_active = False
    db.commit()
    db.refresh(template)
    return template


def list_templates(db: Session, active_only: bool = True) -> List[SurveyTemplate]:
    query = db.query(SurveyTemplate)
    if active_only:
        query = query.filter(SurveyTemplate.is_active == True)
    return query.all()


def get_template(db: Session, template_id: int) -> SurveyTemplate:
    template = db.query(SurveyTemplate).filter(SurveyTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Plantilla de encuesta no encontrada")
    return template


def submit_survey(db: Session, student_id: int, data: SurveyResponseCreate) -> SurveyResponse:
    # Validar que la plantilla existe
    template = get_template(db, data.template_id)
    expected_ids = {q.id for q in template.questions}
    submitted_ids = {a.question_id for a in data.answers}

    if expected_ids != submitted_ids:
        raise HTTPException(
            status_code=400,
            detail="Las respuestas no coinciden con las preguntas de la encuesta"
        )

    response = SurveyResponse(student_id=student_id, template_id=data.template_id)
    db.add(response)
    db.flush()

    for answer in data.answers:
        db.add(SurveyAnswer(
            response_id=response.id,
            question_id=answer.question_id,
            score=answer.score,
        ))

    db.commit()
    db.refresh(response)
    return response


def get_student_responses(db: Session, student_id: int) -> List[SurveyResponse]:
    return (
        db.query(SurveyResponse)
        .filter(SurveyResponse.student_id == student_id)
        .order_by(SurveyResponse.completed_at.desc())
        .all()
    )


def submit_public_survey(
    db: Session, data: PublicSurveyResponseCreate
) -> SurveyResponse:
    """Guardar respuesta pública asociándola a un estudiante real."""
    from app.models.student import Student

    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student or not student.is_active:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    template = get_template(db, data.template_id)
    expected_ids = {q.id for q in template.questions}
    submitted_ids = {a.question_id for a in data.answers}

    if expected_ids != submitted_ids:
        raise HTTPException(
            status_code=400,
            detail="Las respuestas no coinciden con las preguntas de la encuesta",
        )

    response = SurveyResponse(student_id=data.student_id, template_id=data.template_id)
    db.add(response)
    db.flush()

    for answer in data.answers:
        db.add(
            SurveyAnswer(
                response_id=response.id,
                question_id=answer.question_id,
                score=answer.score,
            )
        )

    db.commit()
    db.refresh(response)
    return response
