import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import httpx

from app.config import settings
from app.services.firestore_service import firestore_service
from app.utils.email_cleaner import clean_email_body
from app.schemas.email import ParsedEmail

logger = logging.getLogger("ai_mail_guardian")

GMAIL_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.events"
]

class GmailService:
    def get_auth_url(self, uid: str) -> str:
        """Generates Google OAuth 2.0 Authorization URL requesting offline refresh token."""
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES:
                return "http://localhost:5173/oauth/callback?code=mock_authorization_code"
            raise ValueError("ConfigError: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing.")
            
        client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        }
        
        flow = Flow.from_client_config(
            client_config,
            scopes=GMAIL_SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            prompt="consent",
            state=uid
        )
        return auth_url

    async def handle_oauth_callback(self, uid: str, code: str) -> bool:
        """
        Exchanges OAuth authorization code for Access & Refresh Tokens.
        Stores tokens securely server-side under users/{uid}/integrations/gmail.
        """
        if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES and code == "mock_authorization_code":
            mock_tokens = {
                "token": "mock_access_token_12345",
                "refresh_token": "mock_refresh_token_67890",
                "token_uri": "https://oauth2.googleapis.com/token",
                "client_id": "mock_client_id",
                "client_secret": "mock_client_secret",
                "scopes": GMAIL_SCOPES,
                "connected_at": datetime.utcnow().isoformat(),
                "connected_email": "student@university.edu"
            }
            await firestore_service.save_document(uid, "integrations", "gmail", mock_tokens)
            return True

        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise ValueError("ConfigError: Missing Google OAuth Credentials.")

        client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        }

        flow = Flow.from_client_config(
            client_config,
            scopes=GMAIL_SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Preserve existing refresh token if new exchange returns None
        existing_doc = await firestore_service.get_document(uid, "integrations", "gmail") or {}
        refresh_token = credentials.refresh_token or existing_doc.get("refresh_token")

        token_data = {
            "token": credentials.token,
            "refresh_token": refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes,
            "connected_at": datetime.utcnow().isoformat()
        }

        await firestore_service.save_document(uid, "integrations", "gmail", token_data)
        logger.info(f"Stored Google OAuth tokens securely for user {uid}")
        return True

    async def get_user_credentials(self, uid: str) -> Optional[Credentials]:
        """Retrieves and auto-refreshes Google OAuth Credentials from users/{uid}/integrations/gmail"""
        token_data = await firestore_service.get_document(uid, "integrations", "gmail")
        if not token_data or not token_data.get("token"):
            return None

        if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES and token_data.get("token") == "mock_access_token_12345":
            return None # Use dev mock generator

        creds = Credentials(
            token=token_data.get("token"),
            refresh_token=token_data.get("refresh_token"),
            token_uri=token_data.get("token_uri", "https://oauth2.googleapis.com/token"),
            client_id=token_data.get("client_id", settings.GOOGLE_CLIENT_ID),
            client_secret=token_data.get("client_secret", settings.GOOGLE_CLIENT_SECRET),
            scopes=token_data.get("scopes", GMAIL_SCOPES)
        )

        # Refresh token if expired
        if creds.expired and creds.refresh_token:
            try:
                from google.auth.transport.requests import Request
                creds.refresh(Request())
                updated_data = token_data.copy()
                updated_data["token"] = creds.token
                await firestore_service.save_document(uid, "integrations", "gmail", updated_data)
                logger.info(f"Refreshed Gmail access token for user {uid}")
            except Exception as e:
                logger.error(f"Failed to refresh Gmail OAuth token for user {uid}: {e}")

        return creds

    async def test_gmail_connection(self, uid: str) -> Dict[str, Any]:
        """
        Executes a real Gmail API profile call GET https://gmail.googleapis.com/gmail/v1/users/me/profile
        to verify active OAuth credentials.
        """
        creds = await self.get_user_credentials(uid)
        if not creds:
            return {"success": False, "http_status": 401, "error": "No credentials stored for user."}

        try:
            service = build("gmail", "v1", credentials=creds)
            profile = service.users().getProfile(userId="me").execute()
            return {
                "success": True,
                "http_status": 200,
                "email_address_present": bool(profile.get("emailAddress")),
                "messages_total_present": "messagesTotal" in profile
            }
        except Exception as e:
            logger.error(f"Gmail API profile test call failed for user {uid}: {e}")
            return {"success": False, "http_status": getattr(e, "status_code", 500), "error": str(e)}

    async def fetch_recent_emails(self, uid: str, max_emails: int = 10, query: str = "") -> List[ParsedEmail]:
        """
        Fetches recent emails matching career query, deduplicating against stored Firestore email IDs.
        """
        creds = await self.get_user_credentials(uid)
        
        # If no creds and dev mock mode active, return mock email list
        if not creds:
            if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES:
                return self._get_mock_emails()
            raise ValueError("Gmail account not connected for user.")

        service = build("gmail", "v1", credentials=creds)
        user_id = "me"

        search_query = query or "placement OR internship OR interview OR recruitment OR offer"
        results = service.users().messages().list(userId=user_id, q=search_query, maxResults=max_emails).execute()
        messages = results.get("messages", [])

        parsed_emails = []
        for msg_meta in messages:
            msg_id = msg_meta["id"]
            
            # Deduplication check: Has this email already been processed?
            existing = await firestore_service.get_document(uid, "emails", msg_id)
            if existing:
                continue

            msg = service.users().messages().get(userId=user_id, id=msg_id, format="full").execute()
            payload = msg.get("payload", {})
            headers = payload.get("headers", [])
            
            subject = ""
            sender = ""
            sender_name = ""
            recipient = ""
            date_str = ""

            for h in headers:
                name = h.get("name", "").lower()
                if name == "subject":
                    subject = h.get("value", "")
                elif name == "from":
                    sender = h.get("value", "")
                    if "<" in sender:
                        sender_name = sender.split("<")[0].strip('" ')
                        sender = sender.split("<")[1].strip("> ")
                elif name == "to":
                    recipient = h.get("value", "")
                elif name == "date":
                    date_str = h.get("value", "")

            body = self._extract_body_from_payload(payload)
            cleaned_body = clean_email_body(body)

            parsed = ParsedEmail(
                id=msg_id,
                thread_id=msg.get("threadId"),
                sender=sender,
                sender_name=sender_name or sender,
                recipient=recipient,
                subject=subject,
                snippet=msg.get("snippet", ""),
                raw_body=body,
                cleaned_body=cleaned_body,
                received_at=date_str or datetime.utcnow().isoformat(),
                is_processed=False
            )
            parsed_emails.append(parsed)

        return parsed_emails

    def _extract_body_from_payload(self, payload: Dict[str, Any]) -> str:
        import base64
        body = ""
        if "data" in payload.get("body", {}):
            body_bytes = base64.urlsafe_b64decode(payload["body"]["data"])
            body = body_bytes.decode("utf-8", errors="ignore")
        elif "parts" in payload:
            for part in payload["parts"]:
                mime_type = part.get("mimeType", "")
                if mime_type == "text/plain" and "data" in part.get("body", {}):
                    body_bytes = base64.urlsafe_b64decode(part["body"]["data"])
                    body = body_bytes.decode("utf-8", errors="ignore")
                    break
                elif mime_type == "text/html" and not body and "data" in part.get("body", {}):
                    body_bytes = base64.urlsafe_b64decode(part["body"]["data"])
                    body = body_bytes.decode("utf-8", errors="ignore")
        return body

    def _get_mock_emails(self) -> List[ParsedEmail]:
        """Provides realistic placement, internship, and career email mock data for development."""
        return [
            ParsedEmail(
                id="mock_msg_001",
                sender="placement.cell@university.edu",
                sender_name="University Placement Office",
                recipient="student@university.edu",
                subject="🔴 URGENT: TCS Campus Recruitment Drive 2026 - Registration & OA Schedule",
                snippet="TCS is organizing a campus placement drive for Software Development Engineer (SDE) roles...",
                raw_body="""Dear 2026 Batch Students,

Greetings from Training & Placement Cell!

Tata Consultancy Services (TCS) is conducting a On-Campus Placement Drive for Software Developer roles.

Eligibility Criteria:
- B.Tech (CS, IT, ECE, EEE) 2026 Passing Batch
- Minimum 65% or 7.0 CGPA in B.Tech throughout
- No Active Backlogs

Package: INR 7.5 LPA - 9.0 LPA (Ninja & Digital Profiles)
Location: Pan India / Hyderabad / Bengaluru

Important Dates:
- Registration Deadline: Sep 18, 2026 by 11:59 PM
- Online Assessment (OA): Sep 20, 2026 at 10:00 AM (Test Portal Link will be shared)
- Technical & HR Interviews: Sep 22, 2026 at 09:30 AM (In Person - Block C Auditorium)

Required Application Link: https://placement.university.edu/drives/tcs-2026-sde
Mandatory Documents: Updated Resume, College ID, Semester Marksheets.

Best Regards,
Placement Office
University Training & Placement Cell""",
                cleaned_body="""TCS Campus Recruitment Drive 2026
Role: Software Developer (SDE)
Eligibility: B.Tech CS/IT/ECE/EEE 2026 Batch, >= 7.0 CGPA, No Backlogs
Package: 7.5 LPA - 9.0 LPA
Location: Hyderabad / Bengaluru / Pan India
Registration Deadline: Sep 18, 2026, 11:59 PM
Online Assessment: Sep 20, 2026, 10:00 AM
Interview Date: Sep 22, 2026, 09:30 AM at Block C Auditorium
Application Link: https://placement.university.edu/drives/tcs-2026-sde""",
                received_at=datetime.utcnow().isoformat(),
                is_processed=False
            ),
            ParsedEmail(
                id="mock_msg_002",
                sender="careers@google.com",
                sender_name="Google University Recruiting",
                recipient="student@university.edu",
                subject="Google STEP Internship 2026 - Interview Invitation",
                snippet="Thank you for applying to the Google STEP Internship. We would like to invite you for technical interviews...",
                raw_body="""Hi Alex,

Thank you for your application to Google STEP Internship 2026 (Software Engineering).

We are pleased to invite you for your 45-minute technical interviews scheduled as follows:

Interview Date: Sep 21, 2026
Time: 02:00 PM IST
Format: Google Meet (Link: https://meet.google.com/abc-defg-hij)

Topics covered: Data Structures, Algorithms, Coding in Python/C++.

Please confirm your availability by responding to this email within 24 hours.

Best,
Google University Team""",
                cleaned_body="""Google STEP Internship 2026 - Technical Interview Invitation
Role: Software Engineering Intern
Interview Date: Sep 21, 2026
Time: 02:00 PM IST
Format: Google Meet (https://meet.google.com/abc-defg-hij)
Topics: Data Structures, Algorithms, Coding
Action: Confirm availability within 24 hours.""",
                received_at=datetime.utcnow().isoformat(),
                is_processed=False
            ),
            ParsedEmail(
                id="mock_msg_003",
                sender="newsletter@internshala.com",
                sender_name="Internshala Weekly",
                recipient="student@university.edu",
                subject="Top Web Development Internships this Week",
                snippet="Check out top 10 remote web development internships with stipends up to 15,000/month...",
                raw_body="""Hello Student,

Here are the top 10 web development internships matching your profile this week on Internshala.

Featured:
1. React Frontend Intern at TechCraft (Stipend: Rs 12,000/month)
2. Python Django Intern at DataLabs (Stipend: Rs 15,000/month)

Apply on Internshala portal before Sep 25, 2026.

Happy Learning!""",
                cleaned_body="""Internshala Weekly Top 10 Web Development Internships
Featured: React Frontend Intern (Rs 12k/mo), Python Django Intern (Rs 15k/mo)
Deadline: Sep 25, 2026""",
                received_at=datetime.utcnow().isoformat(),
                is_processed=False
            )
        ]

gmail_service = GmailService()
