import pytest
import asyncio
from app.config import settings
from app.services.gmail_service import gmail_service
from app.services.firestore_service import firestore_service
from google.oauth2.credentials import Credentials

@pytest.mark.asyncio
async def test_oauth_auth_url_structure():
    url = gmail_service.get_auth_url("test_user_123")
    assert "https://accounts.google.com/o/oauth2/auth" in url
    assert settings.GOOGLE_CLIENT_ID in url
    assert "gmail.readonly" in url
    assert "calendar.events" in url

@pytest.mark.asyncio
async def test_firestore_oauth_token_persistence():
    test_uid = "test_user_persistence"
    test_tokens = {
        "token": "ya29.test_access_token",
        "refresh_token": "1//test_refresh_token",
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "scopes": ["https://www.googleapis.com/auth/gmail.readonly"]
    }
    
    # Save token
    await firestore_service.save_document(test_uid, "integrations", "gmail", test_tokens)
    
    # Retrieve credential object
    creds = await gmail_service.get_user_credentials(test_uid)
    assert creds is not None
    assert creds.token == "ya29.test_access_token"
    assert creds.refresh_token == "1//test_refresh_token"
    
    # Cleanup
    await firestore_service.delete_document(test_uid, "integrations", "gmail")
