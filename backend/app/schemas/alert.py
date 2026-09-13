from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.email import PriorityEnum, CategoryEnum

class CareerAlert(BaseModel):
    id: str
    email_id: str
    priority: PriorityEnum
    category: CategoryEnum
    company: Optional[str] = None
    role: Optional[str] = None
    deadline: Optional[str] = None
    interview_date: Optional[str] = None
    interview_time: Optional[str] = None
    interview_location_link: Optional[str] = None
    action_required: Optional[str] = None
    urgency_reason: Optional[str] = None
    summary: str
    whatsapp_sent: bool = False
    whatsapp_status: Optional[str] = None
    calendar_event_id: Optional[str] = None
    created_at: str

class UserSettings(BaseModel):
    whatsapp_enabled: bool = True
    min_priority_threshold: PriorityEnum = PriorityEnum.MEDIUM
    auto_create_calendar_events: bool = False
    scan_frequency_minutes: int = 30
    recipient_phone: Optional[str] = None

class IntegrationStatus(BaseModel):
    service: str
    connected: bool
    details: str
    auth_url: Optional[str] = None

class SystemDiagnostics(BaseModel):
    app_env: str
    use_mock_services: bool
    integrations: List[IntegrationStatus]

class CalendarEventCreate(BaseModel):
    email_id: str
    title: str
    description: str
    start_time: str # ISO string or YYYY-MM-DD HH:MM
    end_time: Optional[str] = None
    location_or_link: Optional[str] = None
