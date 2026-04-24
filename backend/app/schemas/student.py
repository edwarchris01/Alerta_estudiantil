"""
Esquemas Pydantic — Estudiantes.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class StudentCreate(BaseModel):
    user_id: int
    student_code: str = Field(..., max_length=30)
    citizen_id: str = Field(..., max_length=30)
    phone: str = Field(..., max_length=30)
    program: str = Field(..., max_length=150)
    semester: int = Field(..., ge=1, le=20)
    cumulative_gpa: float = Field(0.0, ge=0.0, le=5.0)
    failed_courses: int = Field(0, ge=0)
    absences: int = Field(0, ge=0)
    repeated_courses: int = Field(0, ge=0)
    is_scholarship: bool = False
    enrollment_year: int


class StudentUpdate(BaseModel):
    phone: Optional[str] = Field(None, max_length=30)
    program: Optional[str] = None
    semester: Optional[int] = Field(None, ge=1, le=20)
    cumulative_gpa: Optional[float] = Field(None, ge=0.0, le=5.0)
    failed_courses: Optional[int] = Field(None, ge=0)
    absences: Optional[int] = Field(None, ge=0)
    repeated_courses: Optional[int] = Field(None, ge=0)
    is_scholarship: Optional[bool] = None
    is_active: Optional[bool] = None


class StudentOut(BaseModel):
    id: int
    user_id: int
    student_code: str
    citizen_id: str
    phone: str
    program: str
    semester: int
    cumulative_gpa: float
    failed_courses: int
    absences: int
    repeated_courses: int
    is_scholarship: bool
    enrollment_year: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StudentWithUser(StudentOut):
    """Estudiante con información del usuario asociado."""
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class PublicStudentRegister(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=255)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=255)
    student_code: str = Field(..., max_length=30)
    citizen_id: str = Field(..., max_length=30)
    phone: str = Field(..., max_length=30)
    program: str = Field(..., max_length=150)
    semester: int = Field(..., ge=1, le=20)
    enrollment_year: int = Field(..., ge=2000, le=2100)
