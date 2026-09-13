from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user, UserContext
from app.services.firestore_service import firestore_service
from app.schemas.alert import UserSettings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=UserSettings)
async def get_user_settings(user: UserContext = Depends(get_current_user)):
    """Retrieves user settings and notification preferences."""
    doc = await firestore_service.get_document(user.uid, "settings", "preferences")
    if not doc:
        default_settings = UserSettings()
        await firestore_service.save_document(user.uid, "settings", "preferences", default_settings.dict())
        return default_settings
    return UserSettings(**doc)

@router.post("", response_model=UserSettings)
async def update_user_settings(
    settings: UserSettings,
    user: UserContext = Depends(get_current_user)
):
    """Updates user notification rules, scan frequencies, and consent options."""
    await firestore_service.save_document(user.uid, "settings", "preferences", settings.dict())
    return settings
