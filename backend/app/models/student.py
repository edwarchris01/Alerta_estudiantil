"""
Modelos SQLAlchemy — Datos del Estudiante.
Contiene la información académica e institucional del estudiante.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Boolean,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    student_code = Column(String(30), unique=True, index=True, nullable=False)
    citizen_id = Column(String(30), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=False)
    program = Column(String(150), nullable=False)          # Programa académico
    semester = Column(Integer, nullable=False)               # Semestre actual
    cumulative_gpa = Column(Float, default=0.0)             # Promedio acumulado (0-5)
    failed_courses = Column(Integer, default=0)              # Materias perdidas
    absences = Column(Integer, default=0)                    # Inasistencias acumuladas
    repeated_courses = Column(Integer, default=0)            # Materias repetidas
    is_scholarship = Column(Boolean, default=False)          # Becado
    enrollment_year = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relaciones ──
    user = relationship("User", backref="student_profile")
    surveys = relationship("SurveyResponse", back_populates="student", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student {self.student_code} sem={self.semester}>"
