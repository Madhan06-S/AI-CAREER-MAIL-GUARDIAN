from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.utils.auth import get_current_user, UserContext
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=Dict[str, Any])
async def get_career_analytics(user: UserContext = Depends(get_current_user)):
    """Calculates recruitment analytics, category breakdowns, companies detected, and monthly trends."""
    emails = await firestore_service.list_documents(user.uid, "emails", limit=200)
    
    placement_count = 0
    internship_count = 0
    job_board_count = 0
    general_count = 0
    
    companies = {}
    
    for e in emails:
        analysis = e.get("analysis", {})
        if not analysis:
            continue
            
        cat = analysis.get("category")
        if cat == "PLACEMENT":
            placement_count += 1
        elif cat == "INTERNSHIP":
            internship_count += 1
        elif cat == "JOB_BOARD":
            job_board_count += 1
        else:
            general_count += 1
            
        c_name = analysis.get("company")
        if c_name:
            companies[c_name] = companies.get(c_name, 0) + 1

    top_companies = [{"name": k, "count": v} for k, v in sorted(companies.items(), key=lambda item: item[1], reverse=True)[:10]]

    return {
        "placement_emails_month": placement_count,
        "internship_opportunities": internship_count,
        "job_board_opportunities": job_board_count,
        "general_emails": general_count,
        "total_companies_detected": len(companies),
        "top_companies": top_companies,
        "categories_distribution": [
            {"category": "Placement", "count": placement_count, "color": "#ef4444"},
            {"category": "Internship", "count": internship_count, "color": "#f59e0b"},
            {"category": "Job Boards", "count": job_board_count, "color": "#3b82f6"},
            {"category": "General", "count": general_count, "color": "#10b981"},
        ]
    }
