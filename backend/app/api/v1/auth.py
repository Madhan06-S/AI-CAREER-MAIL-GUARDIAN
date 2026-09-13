from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user, UserContext

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
async def get_user_profile(user: UserContext = Depends(get_current_user)):
    """Returns verified user profile and authenticated UID."""
    return {
        "uid": user.uid,
        "email": user.email,
        "name": user.name,
        "authenticated": True
    }
