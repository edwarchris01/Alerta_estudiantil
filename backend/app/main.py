"""
SIGAE — Sistema Inteligente de Gestión y Alerta Estudiantil
Punto de entrada principal de la API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging

from app.core.config import settings
from app.db.database import Base, engine, check_db_connection
from app.api.routes import auth_router, students_router, surveys_router, risk_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Starting SIGAE API")
    logging.info("Database URL configured: %s", "yes" if settings.DATABASE_URL else "no")
    check_db_connection()
    logging.info("Database connection OK")
    if settings.AUTO_CREATE_TABLES:
        logging.info("AUTO_CREATE_TABLES enabled: creating tables")
        Base.metadata.create_all(bind=engine)
    logging.info("Startup completed")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Plataforma Inteligente de Alerta Temprana para la "
        "Prevención de la Deserción Universitaria"
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Health", "description": "Estado del servicio"},
        {"name": "Autenticación", "description": "Login, registro y gestión de usuarios"},
        {"name": "Estudiantes", "description": "CRUD de perfiles estudiantiles"},
        {"name": "Encuestas", "description": "Plantillas y respuestas de encuestas"},
        {"name": "Riesgo y Dashboard", "description": "Evaluación de riesgo y métricas institucionales"},
    ],
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rutas ──
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(students_router, prefix=API_PREFIX)
app.include_router(surveys_router, prefix=API_PREFIX)
app.include_router(risk_router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s %(asctime)s %(name)s %(message)s",
    )
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
