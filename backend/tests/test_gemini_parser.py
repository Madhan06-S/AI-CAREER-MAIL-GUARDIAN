import pytest
from app.services.gemini_service import gemini_service
from app.schemas.email import PriorityEnum, CategoryEnum

@pytest.mark.asyncio
async def test_placement_email_priority():
    subject = "TCS Campus Placement Drive 2026"
    sender = "placement.office@university.edu"
    body = "TCS recruitment drive for Software Developer role. Registration deadline Sep 18. Interview Sep 22."
    
    analysis = await gemini_service.analyze_email(subject, sender, body)
    assert analysis.priority == PriorityEnum.HIGH
    assert analysis.category in [CategoryEnum.PLACEMENT, CategoryEnum.INTERNSHIP]
    assert analysis.company == "TCS" or "tcs" in (analysis.summary or "").lower()

@pytest.mark.asyncio
async def test_internship_email_priority():
    subject = "Google STEP Internship 2026 - Interview Invitation"
    sender = "careers@google.com"
    body = "We invite you for a 45-minute technical interview on Sep 21 at 2:00 PM."
    
    analysis = await gemini_service.analyze_email(subject, sender, body)
    assert analysis.priority == PriorityEnum.HIGH
    assert "Google" in (analysis.company or "Google")

@pytest.mark.asyncio
async def test_newsletter_email_low_priority():
    subject = "Weekly Career Tips & Tech Digest"
    sender = "newsletter@medium.com"
    body = "Here are 5 tips to ace your next coding interview. Click here to unsubscribe."
    
    analysis = await gemini_service.analyze_email(subject, sender, body)
    assert analysis.priority == PriorityEnum.LOW
