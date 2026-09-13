import logging
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.schemas.email import PriorityEnum
from app.schemas.alert import CareerAlert

logger = logging.getLogger("ai_mail_guardian")

class WhatsAppService:
    def format_career_alert_message(self, alert: CareerAlert) -> str:
        """
        Formats a clean, high-impact WhatsApp text alert with priority badge,
        company, role, deadline, interview info, action step, and urgency reason.
        """
        priority_emoji = "🔴 HIGH PRIORITY" if alert.priority == PriorityEnum.HIGH else ("🟠 MEDIUM PRIORITY" if alert.priority == PriorityEnum.MEDIUM else "🟢 LOW PRIORITY")
        
        company = alert.company or "Career Opportunity"
        role = alert.role or "Position"
        
        msg = f"""{priority_emoji}

🏢 *{company}*
💼 {role}

"""
        if alert.deadline:
            msg += f"📅 *Deadline:* {alert.deadline}\n"
        if alert.interview_date:
            time_str = f" at {alert.interview_time}" if alert.interview_time else ""
            msg += f"🎯 *Interview:* {alert.interview_date}{time_str}\n"
            if alert.interview_location_link:
                msg += f"📍 *Venue/Link:* {alert.interview_location_link}\n"
                
        if alert.urgency_reason:
            msg += f"\n⚡ *Why Important:*\n{alert.urgency_reason}\n"
            
        if alert.action_required:
            msg += f"\n👉 *Action Required:*\n{alert.action_required}\n"
            
        msg += "\n---\n*AI Career Mail Guardian*"
        return msg

    async def send_whatsapp_alert(self, recipient_phone: Optional[str], alert: CareerAlert) -> Dict[str, Any]:
        """
        Dispatches career alert via Meta WhatsApp Cloud API.
        Supports development test phone number mode and production Meta API.
        """
        target_phone = recipient_phone or settings.WHATSAPP_RECIPIENT_PHONE
        message_text = self.format_career_alert_message(alert)
        
        # Development / Mock dispatch mode
        if settings.APP_ENV == "development" and settings.USE_MOCK_SERVICES:
            logger.info(f"[MOCK WHATSAPP] Sent alert for '{alert.company}' to {target_phone or '+15550199'}")
            return {
                "success": True,
                "status": "delivered_mock",
                "message_id": f"wamid.mock_{alert.id}",
                "recipient": target_phone or "+15550199",
                "message_body": message_text
            }

        if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
            raise ValueError("ConfigError: Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID.")

        url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": target_phone,
            "type": "text",
            "text": {
                "preview_url": True,
                "body": message_text
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers, timeout=10.0)
                res_data = response.json()
                
                if response.status_code == 200:
                    msg_id = res_data.get("messages", [{}])[0].get("id", "wamid.unknown")
                    logger.info(f"WhatsApp alert sent successfully to {target_phone}. ID: {msg_id}")
                    return {"success": True, "status": "delivered", "message_id": msg_id}
                else:
                    error_msg = res_data.get("error", {}).get("message", "Unknown Meta API error")
                    logger.error(f"WhatsApp API dispatch failed ({response.status_code}): {error_msg}")
                    return {"success": False, "status": "error", "error": error_msg}
            except Exception as e:
                logger.error(f"WhatsApp network dispatch exception: {e}")
                return {"success": False, "status": "exception", "error": str(e)}

whatsapp_service = WhatsAppService()
