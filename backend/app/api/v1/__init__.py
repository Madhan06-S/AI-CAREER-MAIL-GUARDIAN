from app.api.v1.auth import router as auth_router
from app.api.v1.gmail import router as gmail_router
from app.api.v1.emails import router as emails_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.whatsapp import router as whatsapp_router
from app.api.v1.calendar import router as calendar_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.settings import router as settings_router
from app.api.v1.integrations import router as integrations_router

__all__ = [
    "auth_router",
    "gmail_router",
    "emails_router",
    "alerts_router",
    "whatsapp_router",
    "calendar_router",
    "analytics_router",
    "settings_router",
    "integrations_router"
]
