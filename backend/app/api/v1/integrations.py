from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user, UserContext
from app.config import settings
from app.services.firestore_service import firestore_service
from app.services.gmail_service import gmail_service
from app.schemas.alert import SystemDiagnostics, IntegrationStatus

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("", response_model=SystemDiagnostics)
async def get_integrations_status(user: UserContext = Depends(get_current_user)):
    """Performs real-time diagnostics on all 5 external integrations."""
    # 1. Gmail API status
    gmail_doc = await firestore_service.get_document(user.uid, "integrations", "gmail")
    has_oauth_token = bool(gmail_doc and gmail_doc.get("token"))
    gmail_connected = has_oauth_token or (settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES)
    gmail_details = "Google OAuth connected" if has_oauth_token else ("Dev Mock Mode Active" if settings.USE_MOCK_SERVICES else "Google Account Not Connected")
    gmail_auth_url = gmail_service.get_auth_url(user.uid) if not gmail_connected else None

    # 2. Gemini AI status
    gemini_connected = bool(settings.GEMINI_API_KEY) or (settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES)
    gemini_details = "Gemini API key configured" if settings.GEMINI_API_KEY else ("Dev Mock AI Mode Active" if settings.USE_MOCK_SERVICES else "Missing GEMINI_API_KEY")

    # 3. Firestore status
    firestore_connected = bool(settings.FIREBASE_PROJECT_ID) or (settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES)
    firestore_details = f"Firebase project '{settings.FIREBASE_PROJECT_ID}' active" if settings.FIREBASE_PROJECT_ID else ("Dev Mock Storage Active" if settings.USE_MOCK_SERVICES else "Missing FIREBASE_PROJECT_ID")

    # 4. WhatsApp Cloud API status
    wa_connected = bool(settings.WHATSAPP_ACCESS_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID) or (settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES)
    wa_details = f"Meta Cloud API configured ({settings.WHATSAPP_PHONE_NUMBER_ID})" if settings.WHATSAPP_PHONE_NUMBER_ID else ("Dev Mock WhatsApp Active" if settings.USE_MOCK_SERVICES else "Missing WhatsApp credentials")

    # 5. Google Calendar API status
    cal_connected = gmail_connected

    integrations = [
        IntegrationStatus(service="Gmail API", connected=gmail_connected, details=gmail_details, auth_url=gmail_auth_url),
        IntegrationStatus(service="Gemini AI", connected=gemini_connected, details=gemini_details),
        IntegrationStatus(service="Firebase Firestore", connected=firestore_connected, details=firestore_details),
        IntegrationStatus(service="WhatsApp Cloud API", connected=wa_connected, details=wa_details),
        IntegrationStatus(service="Google Calendar API", connected=cal_connected, details="Inherits Google OAuth Scope" if cal_connected else "Requires Google OAuth")
    ]

    return SystemDiagnostics(
        app_env=settings.APP_ENV,
        use_mock_services=settings.USE_MOCK_SERVICES,
        integrations=integrations
    )
