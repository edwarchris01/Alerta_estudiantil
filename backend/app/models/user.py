"""
Modelos SQLAlchemy — Usuarios del sistema.
Roles: admin, coordinador, bienestar, estudiante
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from app.db.database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    COORDINADOR = "coordinador"
    BIENESTAR = "bienestar"
    ESTUDIANTE = "estudiante"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.ESTUDIANTE, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<User {self.email} role={self.role}>"
