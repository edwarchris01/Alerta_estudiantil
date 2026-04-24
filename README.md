# 🎓 SIGAE — Sistema Inteligente de Gestión y Alerta Estudiantil

> Plataforma de Alerta Temprana para la Detección y Prevención de la Deserción Universitaria

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL%2015-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Python](https://img.shields.io/badge/ML-Python%203.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-Propietaria-red?style=flat-square)]()

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Capacidades Actuales](#capacidades-actuales)
- [Arquitectura](#arquitectura)
- [Flujo del Sistema](#flujo-del-sistema)
- [Índice de Riesgo SIGAE](#índice-de-riesgo-sigae)
- [Fases del Proyecto](#fases-del-proyecto)
- [Roadmap por Módulos](#roadmap-por-módulos)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Políticas Éticas](#políticas-éticas)
- [Equipo Organizacional](#equipo-organizacional)

---

## Descripción

**SIGAE** es una plataforma institucional diseñada para identificar de forma temprana a estudiantes en riesgo de deserción académica, analizar las causas subyacentes y facilitar la intervención oportuna por parte del equipo de bienestar universitario.

### Objetivos Estratégicos

| Objetivo | Descripción |
|----------|-------------|
| 🔍 **Detección Temprana** | Identificar estudiantes en riesgo antes de que abandonen |
| 📊 **Análisis Causal** | Determinar factores económicos, emocionales y académicos |
| ⚡ **Intervención Oportuna** | Facilitar acciones rápidas por coordinadores y bienestar |
| 📈 **Reportes Institucionales** | Dashboards con métricas clave para toma de decisiones |
| 🤖 **Predicción Inteligente** | Modelos de ML para anticipar deserción (Fase 2) |

### Impacto Esperado

- Reducción medible de la tasa de deserción estudiantil
- Ahorro económico institucional por retención mejorada
- Mejora del clima estudiantil y satisfacción académica
- Toma de decisiones basada en evidencia y datos
- Intervención temprana personalizada por estudiante

## Capacidades Actuales

SIGAE ya cuenta con una base funcional operativa para un escenario institucional inicial:

### Para estudiantes

- **Portal público de ingreso** para registro inicial y diligenciamiento de encuestas.
- **Portal autenticado del estudiante** para consultar su estado de riesgo.
- **Actualización de perfil académico y personal** con recálculo del riesgo.
- **Historial de respuestas** y seguimiento de sus propias encuestas.

### Para staff institucional

- **Dashboard institucional** con distribución de riesgo, factores principales, riesgo por programa y por semestre.
- **Alertas tempranas operativas** basadas en el motor actual de reglas.
- **Registro manual de intervenciones** por parte de bienestar o coordinación.
- **Gestión de estudiantes y plantillas de encuestas** desde la interfaz administrativa.

### Base analítica actual

- **Motor de clasificación basado en reglas ponderadas**.
- **Factores académicos y psicosociales** integrados al puntaje.
- **Preparación para Fase 2 con ML** en el módulo analítico del backend.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         React 18 + Tailwind CSS + Recharts          │
│            SPA con React Router v6                  │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (HTTPS)
┌──────────────────────▼──────────────────────────────┐
│                    BACKEND                           │
│              FastAPI + SQLAlchemy                    │
│         Autenticación JWT + RBAC                    │
├─────────────────┬───────────────────────────────────┤
│   PostgreSQL    │       Módulo ML (Fase 2)          │
│   Base de Datos │   Scikit-learn / XGBoost          │
└─────────────────┴───────────────────────────────────┘
```

---

## Flujo del Sistema

```text
Estudiante → Registro / Encuesta
    ↓
SIGAE consolida datos académicos y respuestas
    ↓
Motor de reglas / ML (Fase 2)
    ↓
Clasificación del nivel de riesgo
    ↓
Dashboard institucional y alertas
    ↓
Intervención de bienestar / coordinación
    ↓
Seguimiento y reevaluación del estudiante
```

### Flujo operativo resumido

1. El estudiante se registra o actualiza su información desde el portal.
2. El sistema almacena respuestas de encuestas y datos académicos clave.
3. SIGAE calcula el riesgo con el motor vigente de reglas ponderadas.
4. El equipo institucional visualiza el resultado en dashboard y alertas.
5. Se registra una intervención y posteriormente se reevalúa el caso.

---

## Índice de Riesgo SIGAE

En la versión actual, SIGAE utiliza un **índice de riesgo compuesto** derivado de la suma de factores académicos y de encuesta. No se trata todavía de un modelo predictivo probabilístico, sino de una clasificación institucional basada en reglas.

### Fórmula conceptual actual

$$
IR_{SIGAE} = R_{académico} + R_{económico} + R_{emocional} + R_{motivación} + R_{adaptación}
$$

Donde:

- $R_{académico}$ considera promedio acumulado, materias perdidas, inasistencias y repitencias.
- $R_{económico}$ se deriva de respuestas del cuestionario económico.
- $R_{emocional}$ se deriva de respuestas del cuestionario emocional.
- $R_{motivación}$ incorpora motivación y señales asociadas a carga académica.
- $R_{adaptación}$ se deriva de respuestas sobre adaptación universitaria.

### Niveles actuales de clasificación

| Puntaje total | Nivel |
|---------------|-------|
| 0–2 | 🟢 Bajo |
| 3–4 | 🟡 Medio |
| 5–6 | 🟠 Alto |
| 7 o más | 🔴 Crítico |

### Evolución prevista

En la Fase 2, este índice podrá complementarse con:

- probabilidad de deserción basada en ML,
- variables de mayor influencia (*feature importance*),
- explicaciones trazables para bienestar y coordinación.

---

## Fases del Proyecto

### Fase 1 — MVP (Versión Inicial)
- [x] Encuestas inteligentes con escalas 1–5
- [x] Integración de datos académicos
- [x] Motor de clasificación basado en reglas
- [x] Dashboard institucional con métricas
- [x] Portal público para registro y diligenciamiento de encuestas
- [x] Portal autenticado del estudiante con consulta de riesgo
- [x] Registro manual de intervenciones por parte del staff

### Fase 1.5 — Consolidación Institucional
- [ ] Historial de seguimiento e intervenciones por estudiante
- [ ] Perfil integral de riesgo del estudiante para staff
- [ ] Recomendaciones automáticas de intervención
- [ ] Notificaciones internas y por correo
- [ ] Reportes institucionales exportables
- [ ] Tendencias y evolución temporal del riesgo

### Fase 2 — Inteligencia Artificial
- [ ] Entrenamiento con datos históricos reales
- [ ] Modelos: Logistic Regression, Random Forest, XGBoost
- [ ] Probabilidad de deserción por estudiante
- [ ] Explicabilidad del modelo con factores influyentes
- [ ] Índice de riesgo normalizado y calibrado con evidencia histórica

---

## Roadmap por Módulos

| Módulo | Estado | Próximo paso sugerido |
|--------|--------|-----------------------|
| Alertas tempranas | 🟡 Parcial | Mejorar disparadores automáticos y trazabilidad de causas |
| Seguimiento del estudiante | 🟡 Parcial | Crear historial cronológico de intervenciones y resultados |
| Perfil de riesgo del estudiante | 🟡 Parcial | Consolidar vista única para staff con factores, riesgo e historial |
| Dashboard avanzado | 🟡 Parcial | Agregar tendencias, filtros y evolución temporal |
| Intervenciones recomendadas | ⚪ Planeado | Sugerir acciones según factores detectados |
| Portal del estudiante | 🟢 Implementado | Añadir solicitud de apoyo, tutorías y recomendaciones |
| Notificaciones | ⚪ Planeado | Implementar eventos internos y correo institucional |
| Reportes institucionales | ⚪ Planeado | Exportar informes en PDF y Excel |
| IA explicable | 🟡 Parcial | Conectar `feature_importance` a API y frontend |

### Recomendaciones de priorización

1. **Seguimiento + perfil integral del estudiante**
2. **Intervenciones recomendadas y notificaciones**
3. **Reportes institucionales y dashboard avanzado**
4. **Predicción explicable con IA**

---

## Instalación y Ejecución

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (opcional)

### Opción 1: Docker Compose (Recomendado)

```bash
docker-compose up --build
```

### Opción 2: Ejecución Manual

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

---

## Estructura del Proyecto

```
proyecto_maria_cano/
├── backend/                  # API REST con FastAPI
│   ├── app/
│   │   ├── api/              # Endpoints por dominio
│   │   ├── core/             # Configuración, seguridad, constantes
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── schemas/          # Esquemas Pydantic
│   │   ├── services/         # Lógica de negocio
│   │   └── ml/               # Módulo de Machine Learning (Fase 2)
│   ├── alembic/              # Migraciones de BD
│   ├── tests/                # Tests del backend
│   └── requirements.txt
├── frontend/                 # SPA con React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/            # Páginas/Vistas
│   │   ├── services/         # Llamadas API
│   │   ├── hooks/            # Custom hooks
│   │   └── context/          # Estado global
│   └── package.json
├── docs/                     # Documentación del proyecto
├── docker-compose.yml
└── README.md
```

---

## Políticas Éticas

> Este sistema se rige por principios estrictos de ética y protección de datos.

| Principio | Descripción |
|-----------|-------------|
| 🔒 **Confidencialidad** | Los índices de riesgo son estrictamente confidenciales |
| 🚫 **No Estigmatización** | El sistema no etiqueta ni juzga estudiantes |
| 🤝 **Apoyo Humano** | La plataforma es herramienta de apoyo, no reemplazo del acompañamiento |
| 📋 **Consentimiento** | Los estudiantes dan consentimiento informado para encuestas |
| 🛡️ **Protección de Datos** | Cumplimiento con la Ley 1581 de 2012 (Habeas Data Colombia) |

---

## Equipo Organizacional

Para el funcionamiento efectivo se requiere la participación de:

- **Bienestar Universitario** — Intervención y acompañamiento
- **Coordinadores Académicos** — Seguimiento por programa
- **Oficina de Sistemas** — Infraestructura y mantenimiento
- **Protección de Datos** — Cumplimiento normativo y ético
- **Rectoría / Vicerrectoría** — Respaldo institucional

---

## Licencia

Proyecto de uso institucional exclusivo. Todos los derechos reservados.  
**Universidad María Cano** © 2026
