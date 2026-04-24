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
    DATABASE_URL: str | None = None
    AUTO_CREATE_TABLES: bool = False

    # ── Security ──
    SECRET_KEY: str = "cambiar-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # ── CORS ──
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    @property
    def database_url(self) -> str:
        raw_url = self.DATABASE_URL
        if not raw_url:
            raise RuntimeError(
                "DATABASE_URL no esta configurada. Define la variable de entorno "
                "DATABASE_URL en Render o en un archivo .env."
            )

        if raw_url.startswith("postgres://"):
            raw_url = raw_url.replace("postgres://", "postgresql://", 1)

        if raw_url.startswith("postgresql+psycopg://"):
            raw_url = raw_url.replace("postgresql+psycopg://", "postgresql+psycopg2://", 1)

        if raw_url.startswith("postgresql://"):
            raw_url = raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)

        return raw_url

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
