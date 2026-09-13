from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.utils.auth import get_current_user, UserContext
from app.services.firestore_service import firestore_service
from app.services.gemini_service import gemini_service
from app.schemas.email import ParsedEmail

router = APIRouter(prefix="/emails", tags=["Emails"])

@router.get("", response_model=List[ParsedEmail])
async def list_user_emails(
    limit: int = 50,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    user: UserContext = Depends(get_current_user)
):
    """Lists analyzed emails strictly for authenticated user."""
    items = await firestore_service.list_documents(user.uid, "emails", limit=limit)
    emails = [ParsedEmail(**item) for item in items]
    
    if category:
        emails = [e for e in emails if e.analysis and e.analysis.category == category]
    if priority:
        emails = [e for e in emails if e.analysis and e.analysis.priority == priority]
        
    # Sort newest first
    emails.sort(key=lambda x: x.received_at, reverse=True)
    return emails

@router.get("/{email_id}", response_model=ParsedEmail)
async def get_email_detail(
    email_id: str,
    user: UserContext = Depends(get_current_user)
):
    """Fetches full email details and AI extraction for a specific email ID."""
    doc = await firestore_service.get_document(user.uid, "emails", email_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Email not found.")
    return ParsedEmail(**doc)

@router.post("/{email_id}/re-analyze")
async def reanalyze_email(
    email_id: str,
    user: UserContext = Depends(get_current_user)
):
    """Re-runs Gemini AI extraction on stored email content."""
    doc = await firestore_service.get_document(user.uid, "emails", email_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Email not found.")
        
    email = ParsedEmail(**doc)
    analysis = await gemini_service.analyze_email(
        subject=email.subject,
        sender=email.sender,
        cleaned_body=email.cleaned_body
    )
    email.analysis = analysis
    await firestore_service.save_document(user.uid, "emails", email.id, email.dict())
    return email

@router.post("/{email_id}/mark-handled")
async def mark_email_handled(
    email_id: str,
    user: UserContext = Depends(get_current_user)
):
    """Marks an email as handled by the student."""
    doc = await firestore_service.get_document(user.uid, "emails", email_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Email not found.")
    doc["marked_handled"] = True
    await firestore_service.save_document(user.uid, "emails", email_id, doc)
    return {"success": True, "email_id": email_id, "marked_handled": True}
