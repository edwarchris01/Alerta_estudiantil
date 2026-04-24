"""
Script para poblar la base de datos con datos de ejemplo.
Ejecutar con:  python seed_data.py
"""

import sys
import os
import atexit

sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.survey import (
    SurveyTemplate, SurveyQuestion, SurveyCategory,
)
from app.core.security import hash_password
from app.services.risk_engine import assess_all_students

# ── Crear tablas ──
Base.metadata.create_all(bind=engine)
db = SessionLocal()
atexit.register(db.close)  # garantiza cierre de sesión incluso en caso de excepción

print("🗑️  Limpiando base de datos...")
for table in reversed(Base.metadata.sorted_tables):
    db.execute(table.delete())
db.commit()

# ═══════════════════════════════════════════════════
#  USUARIOS ADMINISTRATIVOS
# ═══════════════════════════════════════════════════
print("👤 Creando usuarios administrativos...")

admin = User(
    email="admin@mariacano.edu.co",
    hashed_password=hash_password("Admin123!"),
    full_name="Administrador del Sistema",
    role=UserRole.ADMIN,
)
coord = User(
    email="coordinador@mariacano.edu.co",
    hashed_password=hash_password("Coord123!"),
    full_name="Carlos Martínez — Coordinador",
    role=UserRole.COORDINADOR,
)
bienestar = User(
    email="bienestar@mariacano.edu.co",
    hashed_password=hash_password("Bien123!"),
    full_name="Laura Gómez — Bienestar",
    role=UserRole.BIENESTAR,
)
db.add_all([admin, coord, bienestar])
db.flush()

# ═══════════════════════════════════════════════════
#  ENCUESTAS
# ═══════════════════════════════════════════════════
print("📋 Creando plantillas de encuestas...")

survey_data = {
    SurveyCategory.MOTIVACION: {
        "title": "Encuesta de Motivación Académica",
        "desc": "Evalúa el nivel de motivación del estudiante hacia sus estudios",
        "questions": [
            "Me siento motivado/a con mi carrera universitaria",
            "Tengo claras mis metas profesionales",
            "Disfruto asistir a clases",
            "Siento que mi carrera me llevará al éxito profesional",
            "Me esfuerzo por obtener buenos resultados académicos",
        ],
    },
    SurveyCategory.ECONOMICA: {
        "title": "Encuesta de Situación Económica",
        "desc": "Evalúa las condiciones económicas que pueden afectar la permanencia",
        "questions": [
            "Cuento con recursos suficientes para cubrir matrícula y gastos",
            "Mi situación económica me permite concentrarme en mis estudios",
            "No he considerado abandonar por motivos económicos",
            "Tengo acceso a materiales y recursos necesarios para estudiar",
            "Mi familia puede apoyarme económicamente durante la carrera",
        ],
    },
    SurveyCategory.EMOCIONAL: {
        "title": "Encuesta de Bienestar Emocional",
        "desc": "Evalúa el estado emocional y salud mental del estudiante",
        "questions": [
            "Me siento tranquilo/a y en paz con mi vida universitaria",
            "Manejo bien el estrés académico",
            "Me siento apoyado/a emocionalmente",
            "No tengo problemas de ansiedad relacionados con la universidad",
            "Duermo bien y tengo buena salud general",
        ],
    },
    SurveyCategory.ADAPTACION: {
        "title": "Encuesta de Adaptación Universitaria",
        "desc": "Evalúa el nivel de integración del estudiante al entorno universitario",
        "questions": [
            "Me siento parte de la comunidad universitaria",
            "Tengo buena relación con mis compañeros",
            "Me adapto bien al ritmo de la universidad",
            "Conozco y uso los servicios de apoyo de la universidad",
            "Me siento cómodo/a con los métodos de enseñanza",
        ],
    },
    SurveyCategory.CARGA_ACADEMICA: {
        "title": "Encuesta de Carga Académica",
        "desc": "Evalúa la percepción del estudiante sobre su carga académica",
        "questions": [
            "Considero que mi carga académica es manejable",
            "Tengo tiempo suficiente para estudiar todas mis materias",
            "No me siento sobrecargado/a de trabajo académico",
            "Puedo equilibrar estudios con otras responsabilidades",
            "Los horarios de clase me permiten una buena organización",
        ],
    },
}

templates = []
for cat, data in survey_data.items():
    t = SurveyTemplate(
        title=data["title"], description=data["desc"],
        category=cat, is_active=True,
    )
    db.add(t)
    db.flush()
    for idx, q_text in enumerate(data["questions"]):
        db.add(SurveyQuestion(
            template_id=t.id, question_text=q_text, order=idx + 1, weight=1,
        ))
    templates.append(t)

db.commit()

# ═══════════════════════════════════════════════════
#  EVALUACIÓN DE RIESGO
# ═══════════════════════════════════════════════════
print("⚡ Ejecutando evaluación de riesgo para todos los estudiantes...")
assessments = assess_all_students(db)

risk_counts = {"bajo": 0, "medio": 0, "alto": 0, "critico": 0}
for a in assessments:
    risk_counts[a.risk_level.value] += 1

print()
print("=" * 55)
print("  ✅  SEED DATA COMPLETADO EXITOSAMENTE")
print("=" * 55)
print("  Usuarios creados:      3")
print("  Estudiantes:           0")
print(f"  Plantillas encuesta:   {len(templates)}")
print(f"  Evaluaciones riesgo:   {len(assessments)}")
print()
print("  ⚠️  Sin respuestas simuladas: los datos reales se cargan")
print("      cuando los estudiantes completan el portal público.")
print()
print("  Distribución de riesgo:")
for level, count in risk_counts.items():
    bar = "█" * count
    print(f"    {level:8s}: {count:3d}  {bar}")
print()
print("  Credenciales de prueba:")
print("    Admin:       admin@mariacano.edu.co / Admin123!")
print("    Coordinador: coordinador@mariacano.edu.co / Coord123!")
print("    Bienestar:   bienestar@mariacano.edu.co / Bien123!")
print()

db.close()
