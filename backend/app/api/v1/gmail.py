from fastapi import APIRouter, Depends, Query, HTTPException
from app.utils.auth import get_current_user, UserContext
from app.services.gmail_service import gmail_service
from app.services.pipeline_service import pipeline_service
from app.schemas.email import EmailScanRequest

router = APIRouter(prefix="/gmail", tags=["Gmail"])

@router.get("/auth-url")
async def get_gmail_auth_url(user: UserContext = Depends(get_current_user)):
    """Generates Google OAuth 2.0 URL requesting offline refresh token for user."""
    url = gmail_service.get_auth_url(user.uid)
    return {"auth_url": url}

@router.post("/oauth-callback")
async def gmail_oauth_callback(
    code: str = Query(...),
    user: UserContext = Depends(get_current_user)
):
    """Exchanges authorization code for access & refresh tokens and stores them in Firestore."""
    success = await gmail_service.handle_oauth_callback(user.uid, code)
    if not success:
        raise HTTPException(status_code=400, detail="OAuth authorization exchange failed.")
    return {"success": True, "message": "Gmail OAuth tokens stored successfully."}

@router.post("/scan")
async def scan_emails(
    request: EmailScanRequest,
    user: UserContext = Depends(get_current_user)
):
    """Triggers career email scan & processing pipeline for authenticated user."""
    result = await pipeline_service.run_email_scan_pipeline(
        uid=user.uid,
        max_emails=request.max_emails,
        query=request.query or ""
    )
    return result
