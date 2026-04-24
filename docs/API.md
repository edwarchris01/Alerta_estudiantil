# API Reference — SIGAE v1.0

**Base URL:** `http://localhost:8000/api/v1`

---

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Iniciar sesión (devuelve JWT) |
| POST | `/auth/register` | Registrar nuevo usuario |
| GET | `/auth/me` | Perfil del usuario autenticado |
| GET | `/auth/users` | Listar usuarios (solo admin) |

## Estudiantes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/students/` | Crear perfil de estudiante |
| POST | `/students/public-register` | Registrar o actualizar estudiante desde portal público |
| GET | `/students/` | Listar estudiantes (filtros: program, semester) |
| GET | `/students/programs` | Programas académicos disponibles |
| GET | `/students/with-details` | Estudiantes con datos de usuario |
| GET | `/students/me` | Perfil académico del estudiante autenticado |
| GET | `/students/{id}` | Obtener estudiante por ID |
| PATCH | `/students/me` | Actualizar datos del estudiante autenticado |
| PATCH | `/students/{id}` | Actualizar datos del estudiante |

## Encuestas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/surveys/templates` | Crear plantilla de encuesta |
| PATCH | `/surveys/templates/{id}` | Actualizar plantilla de encuesta |
| DELETE | `/surveys/templates/{id}` | Archivar plantilla de encuesta |
| GET | `/surveys/templates` | Listar plantillas activas |
| GET | `/surveys/templates/{id}` | Obtener plantilla con preguntas |
| POST | `/surveys/respond` | Enviar respuestas de encuesta |
| POST | `/surveys/respond-public` | Responder encuesta desde portal público |
| GET | `/surveys/my-responses` | Mis respuestas (estudiante) |
| GET | `/surveys/student/{id}/responses` | Respuestas de un estudiante (staff) |

## Riesgo y Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/risk/me` | Última evaluación del estudiante autenticado |
| POST | `/risk/me/assess` | Recalcular riesgo del estudiante autenticado |
| POST | `/risk/assess/{student_id}` | Evaluar riesgo de un estudiante |
| POST | `/risk/assess-all` | Evaluar todos los estudiantes |
| GET | `/risk/student/{student_id}` | Última evaluación de riesgo |
| GET | `/risk/dashboard` | Dashboard institucional completo |
| POST | `/risk/interventions` | Registrar intervención |
| GET | `/risk/interventions/student/{student_id}` | Historial de intervenciones de un estudiante |

---

## Autenticación JWT

Todas las rutas (excepto `/auth/login` y `/auth/register`) requieren:

```
Authorization: Bearer <token>
```

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **admin** | Acceso total al sistema |
| **coordinador** | Dashboard, estudiantes, alertas |
| **bienestar** | Dashboard, estudiantes, alertas, encuestas |
| **estudiante** | Responder encuestas, ver sus respuestas, consultar su riesgo y actualizar su perfil |

## Rutas Públicas

Las siguientes rutas pueden ser utilizadas sin autenticación para soportar el portal externo del estudiante:

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/students/public-register` | Registro inicial o actualización desde portal público |
| GET | `/students/programs` | Consulta de programas académicos |
| GET | `/surveys/templates` | Carga de plantillas activas |
| POST | `/surveys/respond-public` | Envío de respuestas sin login |

## Documentación Interactiva

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
