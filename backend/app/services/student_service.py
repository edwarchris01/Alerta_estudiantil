"""
Servicio de gestión de estudiantes.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.student import StudentCreate, StudentUpdate, StudentWithUser, PublicStudentRegister
from app.core.security import hash_password


PROGRAM_CATALOG = [
    "Ingeniería de Sistemas",
    "Medicina",
    "Derecho",
    "Psicología",
    "Administración de Empresas",
    "Enfermería",
    "Fisioterapia",
    "Contaduría Pública",
]


def create_student(db: Session, data: StudentCreate) -> Student:
    existing = db.query(Student).filter(Student.student_code == data.student_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Código de estudiante ya existe")

    existing_citizen = db.query(Student).filter(Student.citizen_id == data.citizen_id).first()
    if existing_citizen:
        raise HTTPException(status_code=400, detail="La cédula ya está registrada")

    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    student = Student(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def get_student(db: Session, student_id: int) -> Student:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return student


def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    return db.query(Student).filter(Student.user_id == user_id).first()


def get_student_by_code(db: Session, student_code: str) -> Optional[Student]:
    return db.query(Student).filter(Student.student_code == student_code).first()


def _resolve_existing_registration(
    db: Session,
    data: PublicStudentRegister,
) -> tuple[Optional[User], Optional[Student]]:
    user = db.query(User).filter(User.email == data.email).first()
    student_by_code = db.query(Student).filter(Student.student_code == data.student_code).first()
    student_by_citizen = db.query(Student).filter(Student.citizen_id == data.citizen_id).first()

    student_candidates = {s.id: s for s in [student_by_code, student_by_citizen] if s}
    if len(student_candidates) > 1:
        raise HTTPException(status_code=400, detail="El código y la cédula pertenecen a estudiantes distintos")

    student = next(iter(student_candidates.values()), None)

    if user and user.role != UserRole.ESTUDIANTE:
        raise HTTPException(status_code=400, detail="El correo ya pertenece a otro tipo de usuario")

    if student and user and student.user_id != user.id:
        raise HTTPException(status_code=400, detail="El correo ya está vinculado a otro estudiante")

    if student and not user:
        user = db.query(User).filter(User.id == student.user_id).first()

    if user and not student:
        student = get_student_by_user_id(db, user.id)

    return user, student


def register_public_student(db: Session, data: PublicStudentRegister) -> StudentWithUser:
    user, student = _resolve_existing_registration(db, data)

    if user is None:
        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=UserRole.ESTUDIANTE,
            is_active=True,
        )
        db.add(user)
        db.flush()
    else:
        user.email = data.email
        user.full_name = data.full_name
        user.role = UserRole.ESTUDIANTE
        user.is_active = True
        user.hashed_password = hash_password(data.password)

    if student is None:
        student = Student(
            user_id=user.id,
            student_code=data.student_code,
            citizen_id=data.citizen_id,
            phone=data.phone,
            program=data.program,
            semester=data.semester,
            enrollment_year=data.enrollment_year,
            cumulative_gpa=0.0,
            failed_courses=0,
            absences=0,
            repeated_courses=0,
            is_scholarship=False,
            is_active=True,
        )
        db.add(student)
    else:
        student.user_id = user.id
        student.student_code = data.student_code
        student.citizen_id = data.citizen_id
        student.phone = data.phone
        student.program = data.program
        student.semester = data.semester
        student.enrollment_year = data.enrollment_year
        student.is_active = True

    db.commit()
    db.refresh(student)

    result = StudentWithUser.model_validate(student)
    result.user_name = user.full_name
    result.user_email = user.email
    return result


def list_students(
    db: Session,
    program: Optional[str] = None,
    semester: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Student]:
    query = db.query(Student)
    if program:
        query = query.filter(Student.program == program)
    if semester:
        query = query.filter(Student.semester == semester)
    return query.offset(skip).limit(limit).all()


def update_student(db: Session, student_id: int, data: StudentUpdate) -> Student:
    student = get_student(db, student_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


def get_students_with_user_info(db: Session, program: Optional[str] = None) -> List[StudentWithUser]:
    query = (
        db.query(Student, User)
        .join(User, Student.user_id == User.id)
    )
    if program:
        query = query.filter(Student.program == program)

    results = []
    for student, user in query.all():
        data = StudentWithUser.model_validate(student)
        data.user_name = user.full_name
        data.user_email = user.email
        results.append(data)
    return results


def get_programs(db: Session) -> List[str]:
    """Retorna la lista de programas académicos distintos."""
    rows = db.query(Student.program).distinct().all()
    programs = sorted({r[0] for r in rows if r[0]})
    return programs or PROGRAM_CATALOG
