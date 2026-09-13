import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from googleapiclient.discovery import build

from app.config import settings
from app.services.gmail_service import gmail_service
from app.schemas.alert import CalendarEventCreate

logger = logging.getLogger("ai_mail_guardian")

class CalendarService:
    async def create_calendar_event(self, uid: str, event_data: CalendarEventCreate) -> Dict[str, Any]:
        """
        Creates an interview schedule or deadline event directly in the user's Google Calendar
        using their server-side stored Google OAuth credentials.
        """
        creds = await gmail_service.get_user_credentials(uid)
        
        # Development / Mock mode
        if not creds:
            if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES:
                logger.info(f"[MOCK CALENDAR] Created event '{event_data.title}' for user {uid}")
                return {
                    "success": True,
                    "event_id": f"cal_evt_mock_{datetime.utcnow().timestamp()}",
                    "html_link": "https://calendar.google.com/calendar/r/eventedit",
                    "status": "created_mock"
                }
            raise ValueError("Google Calendar account not connected. Please connect Google OAuth.")

        service = build("calendar", "v3", credentials=creds)

        # Parse dates
        start_time_iso = event_data.start_time
        if "T" not in start_time_iso and len(start_time_iso) == 10:
            start_time_iso += "T09:00:00Z"

        # End time defaults to 1 hour after start time if not provided
        if event_data.end_time:
            end_time_iso = event_data.end_time
        else:
            try:
                dt_start = datetime.fromisoformat(start_time_iso.replace("Z", "+00:00"))
                dt_end = dt_start + timedelta(hours=1)
                end_time_iso = dt_end.isoformat()
            except Exception:
                end_time_iso = start_time_iso

        event_body = {
            "summary": event_data.title,
            "description": event_data.description + "\n\nCreated by AI Career Mail Guardian.",
            "start": {"dateTime": start_time_iso, "timeZone": "Asia/Kolkata"},
            "end": {"dateTime": end_time_iso, "timeZone": "Asia/Kolkata"},
            "location": event_data.location_or_link or "",
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": 60},
                    {"method": "popup", "minutes": 1440}, # 1 day before
                ],
            },
        }

        try:
            created_event = service.events().insert(calendarId="primary", body=event_body).execute()
            logger.info(f"Created Google Calendar event '{event_data.title}' for user {uid}. ID: {created_event.get('id')}")
            return {
                "success": True,
                "event_id": created_event.get("id"),
                "html_link": created_event.get("htmlLink"),
                "status": "created"
            }
        except Exception as e:
            logger.error(f"Failed to create Google Calendar event for user {uid}: {e}")
            return {"success": False, "status": "error", "error": str(e)}

calendar_service = CalendarService()
