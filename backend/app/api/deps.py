"""
Dependencias compartidas para las rutas de la API.
"""

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import oauth2_scheme
from app.models.user import User, UserRole
from app.services.auth_service import get_current_user as _get_current_user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    return _get_current_user(db, token)


def get_current_active_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada")
    return user


def require_admin(user: User = Depends(get_current_active_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return user


def require_staff(user: User = Depends(get_current_active_user)) -> User:
    """Admin, coordinador o bienestar."""
    allowed = {UserRole.ADMIN, UserRole.COORDINADOR, UserRole.BIENESTAR}
    if user.role not in allowed:
        raise HTTPException(status_code=403, detail="Acceso restringido al equipo institucional")
    return user
