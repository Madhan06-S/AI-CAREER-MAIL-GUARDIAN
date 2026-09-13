from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user, UserContext
from app.services.calendar_service import calendar_service
from app.services.firestore_service import firestore_service
from app.schemas.alert import CalendarEventCreate

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.post("/create-event")
async def create_calendar_event(
    payload: CalendarEventCreate,
    user: UserContext = Depends(get_current_user)
):
    """Creates a Google Calendar event directly in user's calendar using OAuth token."""
    result = await calendar_service.create_calendar_event(user.uid, payload)
    
    if result.get("success"):
        # Update email/alert doc with event ID
        email_doc = await firestore_service.get_document(user.uid, "emails", payload.email_id)
        if email_doc:
            email_doc["calendar_event_id"] = result.get("event_id")
            await firestore_service.save_document(user.uid, "emails", payload.email_id, email_doc)
            
    return result
