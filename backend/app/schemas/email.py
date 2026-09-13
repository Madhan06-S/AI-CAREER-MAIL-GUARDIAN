from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class PriorityEnum(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class CategoryEnum(str, Enum):
    PLACEMENT = "PLACEMENT"
    INTERNSHIP = "INTERNSHIP"
    JOB_BOARD = "JOB_BOARD"
    GENERAL = "GENERAL"

class StructuredEmailAnalysis(BaseModel):
    priority: PriorityEnum = Field(description="Priority: HIGH (red), MEDIUM (orange), LOW (green)")
    category: CategoryEnum = Field(description="Email category")
    company: Optional[str] = Field(default=None, description="Name of company offering role")
    role: Optional[str] = Field(default=None, description="Job or internship position title")
    job_type: Optional[str] = Field(default=None, description="Full Time, Internship, Part Time, Contract")
    eligibility: List[str] = Field(default_factory=list, description="Eligibility criteria e.g. CGPA >= 7.5, CS/IT 2026 Batch")
    salary_stipend: Optional[str] = Field(default=None, description="Package / salary or stipend info")
    location: Optional[str] = Field(default=None, description="Job or interview location / Remote")
    deadline: Optional[str] = Field(default=None, description="Application or registration deadline")
    interview_date: Optional[str] = Field(default=None, description="Interview or online assessment date")
    interview_time: Optional[str] = Field(default=None, description="Interview or assessment time")
    interview_location_link: Optional[str] = Field(default=None, description="Interview venue or video call link")
    required_skills: List[str] = Field(default_factory=list, description="Key technical or soft skills requested")
    application_url: Optional[str] = Field(default=None, description="Direct URL to apply or register")
    action_required: Optional[str] = Field(default=None, description="Recommended next step for student")
    urgency_reason: Optional[str] = Field(default=None, description="Short explanation why priority was assigned")
    summary: str = Field(description="Concise 2-3 sentence summary of email content")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="AI extraction confidence score")

class ParsedEmail(BaseModel):
    id: str
    thread_id: Optional[str] = None
    sender: str
    sender_name: Optional[str] = None
    recipient: str
    subject: str
    snippet: str
    raw_body: str
    cleaned_body: str
    received_at: str
    is_processed: bool = False
    analysis: Optional[StructuredEmailAnalysis] = None
    marked_handled: bool = False
    created_at: Optional[str] = None

class EmailScanRequest(BaseModel):
    max_emails: int = Field(default=10, ge=1, le=50)
    query: Optional[str] = "placement OR internship OR recruitment OR interview OR offer"
