"""
SIGAE — Sistema Inteligente de Gestión y Alerta Estudiantil
Configuración central de la aplicación.
"""

from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # ── App ──
    APP_NAME: str = "SIGAE"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ──
    DATABASE_URL: str = "postgresql+psycopg://sigae_user:sigae_secret@localhost:5432/sigae_db"

    # ── Security ──
    SECRET_KEY: str = "cambiar-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # ── CORS ──
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
