import logging
from typing import Dict, Any, List
from datetime import datetime

from app.services.gmail_service import gmail_service
from app.services.gemini_service import gemini_service
from app.services.firestore_service import firestore_service
from app.services.whatsapp_service import whatsapp_service
from app.services.calendar_service import calendar_service
from app.schemas.alert import CareerAlert, UserSettings, CalendarEventCreate
from app.schemas.email import PriorityEnum

logger = logging.getLogger("ai_mail_guardian")

class PipelineService:
    async def run_email_scan_pipeline(self, uid: str, max_emails: int = 10, query: str = "") -> Dict[str, Any]:
        """
        Executes end-to-end career email monitoring pipeline for user:
        Gmail Fetch -> Clean -> Gemini Extraction -> Priority -> Firestore Save -> WhatsApp Alert -> Calendar Suggestion.
        Errors on individual emails are logged without breaking pipeline processing for remaining emails.
        """
        logger.info(f"Starting career email scan pipeline for user: {uid}")
        
        # 1. Fetch user settings
        settings_dict = await firestore_service.get_document(uid, "settings", "preferences") or {}
        user_settings = UserSettings(**settings_dict)

        # 2. Fetch recent Gmail messages
        try:
            emails = await gmail_service.fetch_recent_emails(uid, max_emails=max_emails, query=query)
        except Exception as e:
            logger.error(f"Gmail fetch failed for user {uid}: {e}")
            return {"success": False, "error": str(e), "processed_count": 0}

        processed_count = 0
        alerts_generated = 0
        whatsapp_sent_count = 0
        errors = []

        for email in emails:
            try:
                # 3. Gemini AI Analysis
                analysis = await gemini_service.analyze_email(
                    subject=email.subject,
                    sender=email.sender,
                    cleaned_body=email.cleaned_body
                )
                
                email.is_processed = True
                email.analysis = analysis
                
                # 4. Save processed email to Firestore users/{uid}/emails/{email_id}
                await firestore_service.save_document(
                    uid=uid,
                    collection_name="emails",
                    doc_id=email.id,
                    data=email.dict()
                )
                processed_count += 1

                # 5. Determine if Career Alert should be created
                should_alert = False
                if user_settings.min_priority_threshold == PriorityEnum.HIGH and analysis.priority == PriorityEnum.HIGH:
                    should_alert = True
                elif user_settings.min_priority_threshold == PriorityEnum.MEDIUM and analysis.priority in [PriorityEnum.HIGH, PriorityEnum.MEDIUM]:
                    should_alert = True

                if should_alert:
                    alerts_generated += 1
                    alert_id = f"alert_{email.id}"
                    
                    alert = CareerAlert(
                        id=alert_id,
                        email_id=email.id,
                        priority=analysis.priority,
                        category=analysis.category,
                        company=analysis.company,
                        role=analysis.role,
                        deadline=analysis.deadline,
                        interview_date=analysis.interview_date,
                        interview_time=analysis.interview_time,
                        interview_location_link=analysis.interview_location_link,
                        action_required=analysis.action_required,
                        urgency_reason=analysis.urgency_reason,
                        summary=analysis.summary,
                        whatsapp_sent=False,
                        created_at=datetime.utcnow().isoformat()
                    )

                    # Dispatch WhatsApp alert if enabled
                    if user_settings.whatsapp_enabled:
                        wa_result = await whatsapp_service.send_whatsapp_alert(
                            recipient_phone=user_settings.recipient_phone,
                            alert=alert
                        )
                        if wa_result.get("success"):
                            alert.whatsapp_sent = True
                            alert.whatsapp_status = wa_result.get("status")
                            whatsapp_sent_count += 1

                    # Save career alert to Firestore users/{uid}/career_alerts/{alert_id}
                    await firestore_service.save_document(
                        uid=uid,
                        collection_name="career_alerts",
                        doc_id=alert_id,
                        data=alert.dict()
                    )

                    # Auto Calendar suggestion/creation if configured
                    if user_settings.auto_create_calendar_events and analysis.interview_date:
                        try:
                            cal_event = CalendarEventCreate(
                                email_id=email.id,
                                title=f"{analysis.company or 'Recruitment'} - {analysis.role or 'Interview'}",
                                description=f"Extracted by AI Career Mail Guardian.\nSummary: {analysis.summary}",
                                start_time=analysis.interview_date,
                                location_or_link=analysis.interview_location_link
                            )
                            await calendar_service.create_calendar_event(uid, cal_event)
                        except Exception as cal_err:
                            logger.warning(f"Auto-calendar creation failed for {email.id}: {cal_err}")

            except Exception as email_err:
                logger.error(f"Error processing email {email.id} for user {uid}: {email_err}")
                errors.append({"email_id": email.id, "error": str(email_err)})

        return {
            "success": True,
            "processed_count": processed_count,
            "alerts_generated": alerts_generated,
            "whatsapp_sent_count": whatsapp_sent_count,
            "errors": errors
        }

pipeline_service = PipelineService()
