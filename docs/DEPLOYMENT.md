# Guía de Despliegue — SIGAE

## Desarrollo Local

### Requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (opcional)

---

### Opción 1: Docker Compose (Recomendado)

```bash
docker-compose up --build
```

Esto levanta:
- **PostgreSQL** en puerto 5432
- **Backend FastAPI** en puerto 8000
- **Frontend React** en puerto 5173

Poblar datos de ejemplo:
```bash
docker exec sigae_backend python seed_data.py
```

---

### Opción 2: Ejecución Manual

**Base de datos:**
```sql
CREATE DATABASE sigae_db;
CREATE USER sigae_user WITH PASSWORD 'sigae_secret';
GRANT ALL PRIVILEGES ON DATABASE sigae_db TO sigae_user;
```

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # Ajustar si es necesario
python seed_data.py
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Datos de Prueba

Ejecutar `python seed_data.py` desde la carpeta `backend/` crea:
- 3 usuarios administrativos
- 30 estudiantes con datos académicos variados
- 5 plantillas de encuestas (5 preguntas c/u)
- Respuestas simuladas correlacionadas con rendimiento
- Evaluaciones de riesgo calculadas

### Credenciales

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@mariacano.edu.co | Admin123! |
| Coordinador | coordinador@mariacano.edu.co | Coord123! |
| Bienestar | bienestar@mariacano.edu.co | Bien123! |
| Estudiante | estudiante1@est.mariacano.edu.co | Est123! |

---

## Producción

Para despliegue en producción:

1. Cambiar `SECRET_KEY` por un valor seguro (`openssl rand -hex 32`)
2. Configurar HTTPS con certificado SSL
3. Usar variables de entorno (no archivos `.env`)
4. Configurar backups automáticos de PostgreSQL
5. Implementar rate limiting en el API Gateway
6. Activar logging estructurado (JSON)
7. Configurar monitoreo de salud (`/health`)
