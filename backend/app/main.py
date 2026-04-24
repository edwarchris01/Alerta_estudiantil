"""
SIGAE — Sistema Inteligente de Gestión y Alerta Estudiantil
Punto de entrada principal de la API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import Base, engine
from app.api.routes import auth_router, students_router, surveys_router, risk_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas al iniciar (en producción usar Alembic)
    Base.metadata.create_all(bind=engine)
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
