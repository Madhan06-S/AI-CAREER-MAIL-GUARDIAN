from app.services.whatsapp_service import whatsapp_service
from app.schemas.alert import CareerAlert
from app.schemas.email import PriorityEnum, CategoryEnum
from datetime import datetime

def test_format_whatsapp_alert():
    alert = CareerAlert(
        id="alert_test_1",
        email_id="email_1",
        priority=PriorityEnum.HIGH,
        category=CategoryEnum.PLACEMENT,
        company="TCS",
        role="Software Developer",
        deadline="Sep 18, 11:59 PM",
        interview_date="Sep 20",
        interview_time="10:00 AM",
        interview_location_link="Block C Auditorium",
        action_required="Apply before deadline on placement portal.",
        urgency_reason="Registration deadline approaching.",
        summary="TCS Campus Drive",
        created_at=datetime.utcnow().isoformat()
    )

    msg = whatsapp_service.format_career_alert_message(alert)
    assert "🔴 HIGH PRIORITY" in msg
    assert "*TCS*" in msg
    assert "Software Developer" in msg
    assert "*Deadline:* Sep 18, 11:59 PM" in msg
    assert "Block C Auditorium" in msg
    assert "Apply before deadline" in msg
