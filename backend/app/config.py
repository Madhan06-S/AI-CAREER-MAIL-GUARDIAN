import os
import logging
from typing import Optional
from pydantic_settings import BaseSettings

logger = logging.getLogger("ai_mail_guardian")

class Settings(BaseSettings):
    APP_ENV: str = "development"
    USE_MOCK_SERVICES: bool = True
    PORT: int = 8000
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    
    # Google OAuth 2.0
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:5173/oauth/callback"
    
    # Firebase Admin SDK
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    
    # WhatsApp Cloud API
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_RECIPIENT_PHONE: Optional[str] = None

    class Config:
        env_file = ["../.env", ".env"]
        env_file_encoding = "utf-8"
        extra = "ignore"

    def validate_production_credentials(self):
        """
        Validates that required credentials are strictly set when running in production mode.
        Production MUST NEVER fall back to mock services or missing secrets.
        """
        if self.APP_ENV == "production":
            if self.USE_MOCK_SERVICES:
                raise ValueError("ConfigError: USE_MOCK_SERVICES cannot be True when APP_ENV is 'production'.")
            
            missing = []
            if not self.GEMINI_API_KEY:
                missing.append("GEMINI_API_KEY")
            if not self.GOOGLE_CLIENT_ID or not self.GOOGLE_CLIENT_SECRET:
                missing.append("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET")
            if not self.FIREBASE_PROJECT_ID:
                missing.append("FIREBASE_PROJECT_ID")
            
            if missing:
                raise ValueError(f"ConfigError: Production missing required credentials: {', '.join(missing)}")
            logger.info("Production configuration validated successfully. All required secrets present.")
        else:
            if self.USE_MOCK_SERVICES:
                logger.warning("Running in DEVELOPMENT mode with MOCK services enabled.")

settings = Settings()
settings.validate_production_credentials()
