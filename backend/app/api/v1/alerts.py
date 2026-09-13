from fastapi import APIRouter, Depends
from typing import List, Optional
from app.utils.auth import get_current_user, UserContext
from app.services.firestore_service import firestore_service
from app.schemas.alert import CareerAlert

router = APIRouter(prefix="/alerts", tags=["Career Alerts"])

@router.get("", response_model=List[CareerAlert])
async def list_career_alerts(
    limit: int = 50,
    priority: Optional[str] = None,
    user: UserContext = Depends(get_current_user)
):
    """Lists urgent career alerts for the user."""
    items = await firestore_service.list_documents(user.uid, "career_alerts", limit=limit)
    alerts = [CareerAlert(**item) for item in items]
    
    if priority:
        alerts = [a for a in alerts if a.priority == priority]
        
    alerts.sort(key=lambda x: x.created_at, reverse=True)
    return alerts

@router.get("/summary")
async def get_alert_summary(user: UserContext = Depends(get_current_user)):
    """Computes real-time alert priority counts and deadline metrics."""
    emails = await firestore_service.list_documents(user.uid, "emails", limit=100)
    alerts = await firestore_service.list_documents(user.uid, "career_alerts", limit=100)
    
    high_count = sum(1 for e in emails if e.get("analysis", {}).get("priority") == "HIGH")
    med_count = sum(1 for e in emails if e.get("analysis", {}).get("priority") == "MEDIUM")
    low_count = sum(1 for e in emails if e.get("analysis", {}).get("priority") == "LOW")
    
    deadlines = [e for e in emails if e.get("analysis", {}).get("deadline")]
    interviews = [e for e in emails if e.get("analysis", {}).get("interview_date")]
    
    return {
        "total_emails_analyzed": len(emails),
        "high_priority_count": high_count,
        "medium_priority_count": med_count,
        "low_priority_count": low_count,
        "upcoming_deadlines_count": len(deadlines),
        "upcoming_interviews_count": len(interviews),
        "total_alerts": len(alerts)
    }
