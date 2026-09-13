from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.utils.auth import get_current_user, UserContext
from app.services.firestore_service import firestore_service
from app.services.whatsapp_service import whatsapp_service
from app.schemas.alert import CareerAlert
from app.schemas.email import PriorityEnum, CategoryEnum
from datetime import datetime

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

class TestAlertRequest(BaseModel):
    phone_number: Optional[str] = None
    alert_id: Optional[str] = None

@router.post("/send-test")
async def send_test_whatsapp_alert(
    payload: TestAlertRequest,
    user: UserContext = Depends(get_current_user)
):
    """Dispatches a test career alert via Meta WhatsApp Cloud API."""
    target_phone = payload.phone_number
    
    if payload.alert_id:
        doc = await firestore_service.get_document(user.uid, "career_alerts", payload.alert_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Alert not found.")
        alert = CareerAlert(**doc)
    else:
        alert = CareerAlert(
            id="test_alert_001",
            email_id="test_email",
            priority=PriorityEnum.HIGH,
            category=CategoryEnum.PLACEMENT,
            company="TCS",
            role="Software Developer",
            deadline="Sep 18, 11:59 PM",
            interview_date="Sep 20",
            interview_time="10:00 AM",
            interview_location_link="Block C Auditorium",
            action_required="Apply before deadline on placement portal.",
            urgency_reason="Eligibility confirmed and application deadline approaching.",
            summary="TCS Campus Placement Drive for 2026 Batch.",
            created_at=datetime.utcnow().isoformat()
        )

    result = await whatsapp_service.send_whatsapp_alert(target_phone, alert)
    return result
