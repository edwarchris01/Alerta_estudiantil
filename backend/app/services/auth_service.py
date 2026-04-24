"""
Servicio de Autenticación y gestión de usuarios.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def create_user(db: Session, data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> TokenResponse:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada")

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


def get_current_user(db: Session, token: str) -> User:
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


def require_roles(*roles: UserRole):
    """Dependency factory para restricción por rol."""
    def check_role(user: User):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Sin permisos para esta acción")
        return user
    return check_role


def list_users(db: Session, skip: int = 0, limit: int = 50):
    return db.query(User).offset(skip).limit(limit).all()
