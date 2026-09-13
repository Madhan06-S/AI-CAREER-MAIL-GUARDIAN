import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.v1 import (
    auth_router,
    gmail_router,
    emails_router,
    alerts_router,
    whatsapp_router,
    calendar_router,
    analytics_router,
    settings_router,
    integrations_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_mail_guardian")

app = FastAPI(
    title="AI Career Mail Guardian Backend API",
    description="Production-grade FastAPI backend for AI-powered career email monitoring, Gemini extraction, WhatsApp alerts, and Google Calendar scheduling.",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5175",
    "http://localhost:5173",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception caught on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )

# Include Routers
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(gmail_router, prefix=api_v1_prefix)
app.include_router(emails_router, prefix=api_v1_prefix)
app.include_router(alerts_router, prefix=api_v1_prefix)
app.include_router(whatsapp_router, prefix=api_v1_prefix)
app.include_router(calendar_router, prefix=api_v1_prefix)
app.include_router(analytics_router, prefix=api_v1_prefix)
app.include_router(settings_router, prefix=api_v1_prefix)
app.include_router(integrations_router, prefix=api_v1_prefix)

@app.get("/")
async def root():
    return {
        "app": "AI Career Mail Guardian",
        "version": "1.0.0",
        "status": "healthy",
        "environment": settings.APP_ENV,
        "mock_mode": settings.USE_MOCK_SERVICES,
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "app_env": settings.APP_ENV}
