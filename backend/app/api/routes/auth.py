"""
Rutas de Autenticación y Usuarios.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserOut
from app.services import auth_service
from app.api.deps import get_current_active_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, data.email, data.password)


@router.post("/register", response_model=UserOut, summary="Registrar usuario (solo admin)")
def register(
    data: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return auth_service.create_user(db, data)


@router.get("/me", response_model=UserOut, summary="Perfil del usuario actual")
def me(user: User = Depends(get_current_active_user)):
    return user


@router.get("/users", response_model=List[UserOut], summary="Listar usuarios (admin)")
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return auth_service.list_users(db, skip, limit)
