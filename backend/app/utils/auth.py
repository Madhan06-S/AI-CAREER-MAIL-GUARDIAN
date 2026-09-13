from fastapi import Header, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional
import logging
from app.config import settings

logger = logging.getLogger("ai_mail_guardian")

class UserContext(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None

# Global Firebase Admin initialization state
_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    
    if settings.FIREBASE_PROJECT_ID and settings.FIREBASE_PRIVATE_KEY:
        try:
            import firebase_admin
            from firebase_admin import credentials
            
            private_key = settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n')
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "private_key": private_key,
            })
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            if settings.APP_ENV == "production":
                raise e

init_firebase()

async def get_current_user(authorization: Optional[str] = Header(None)) -> UserContext:
    """
    Validates Firebase ID Token from Authorization header.
    Extracts authenticated `uid` directly from verified token payload.
    Ensures zero-trust user isolation across all routes.
    """
    if not authorization:
        if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES:
            # Development fallback user context
            return UserContext(
                uid="dev_student_123",
                email="student@university.edu",
                name="Alex Dev Student"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_parts = authorization.split(" ")
    if len(token_parts) != 2 or token_parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization Header Format. Use 'Bearer <token>'",
        )
    
    id_token = token_parts[1]
    
    try:
        import firebase_admin.auth
        decoded_token = firebase_admin.auth.verify_id_token(id_token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name")
        
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing uid claim",
            )
            
        return UserContext(uid=uid, email=email, name=name)
        
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}")
        if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES:
            return UserContext(
                uid="dev_student_123",
                email="student@university.edu",
                name="Alex Dev Student"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )
