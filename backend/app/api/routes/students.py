"""
Rutas de Estudiantes — CRUD y consultas.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentOut,
    StudentWithUser,
    PublicStudentRegister,
)
from app.services import student_service
from app.api.deps import require_staff, get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/students", tags=["Estudiantes"])


@router.post("/", response_model=StudentOut, summary="Crear perfil de estudiante")
def create(
    data: StudentCreate,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return student_service.create_student(db, data)


@router.post(
    "/public-register",
    response_model=StudentWithUser,
    summary="Registrar o actualizar estudiante desde el portal público",
)
def public_register(
    data: PublicStudentRegister,
    db: Session = Depends(get_db),
):
    return student_service.register_public_student(db, data)


@router.get("/", response_model=List[StudentOut], summary="Listar estudiantes")
def list_students(
    program: Optional[str] = Query(None),
    semester: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return student_service.list_students(db, program, semester, skip, limit)


@router.get("/programs", response_model=List[str], summary="Programas académicos disponibles")
def get_programs(db: Session = Depends(get_db)):
    return student_service.get_programs(db)


@router.get(
    "/with-details",
    response_model=List[StudentWithUser],
    summary="Estudiantes con info de usuario",
)
def list_with_details(
    program: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return student_service.get_students_with_user_info(db, program)


@router.get(
    "/me",
    response_model=StudentOut,
    summary="Perfil académico del estudiante autenticado",
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    student = student_service.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Perfil de estudiante no encontrado")
    return student


@router.patch(
    "/me",
    response_model=StudentOut,
    summary="Actualizar datos personales del estudiante autenticado",
)
def update_my_profile(
    data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    student = student_service.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Perfil de estudiante no encontrado")
    # Students cannot deactivate their own account
    data_dict = data.model_dump(exclude_unset=True)
    data_dict.pop("is_active", None)
    from app.schemas.student import StudentUpdate as SU
    safe_data = SU(**data_dict)
    return student_service.update_student(db, student.id, safe_data)


@router.get("/{student_id}", response_model=StudentOut, summary="Obtener estudiante por ID")
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return student_service.get_student(db, student_id)


@router.patch("/{student_id}", response_model=StudentOut, summary="Actualizar datos del estudiante")
def update_student(
    student_id: int,
    data: StudentUpdate,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return student_service.update_student(db, student_id, data)
