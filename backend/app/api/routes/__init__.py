from app.api.routes.auth import router as auth_router
from app.api.routes.students import router as students_router
from app.api.routes.surveys import router as surveys_router
from app.api.routes.risk import router as risk_router

__all__ = ["auth_router", "students_router", "surveys_router", "risk_router"]
