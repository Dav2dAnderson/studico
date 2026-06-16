import json
import urllib.request
import urllib.error
import logging
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings

logger = logging.getLogger(__name__)

class ResendEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0
        
        api_key = getattr(settings, "RESEND_API_KEY", None)
        if not api_key:
            logger.error("RESEND_API_KEY is not configured in settings.")
            if not self.fail_silently:
                raise ValueError("RESEND_API_KEY is not configured in settings.")
            return 0

        num_sent = 0
        for message in email_messages:
            try:
                url = "https://api.resend.com/emails"
                
                # Resend requires the 'from' email to match a verified domain in your Resend account.
                # If no domain is verified, you must use 'onboarding@resend.dev'.
                from_email = message.from_email
                if from_email == "webmaster@localhost" or from_email == "noreply@studico.com":
                    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "onboarding@resend.dev")

                payload = {
                    "from": from_email,
                    "to": message.to,
                    "subject": message.subject,
                    "text": message.body,
                }
                
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "Django-Resend-Client"
                    },
                    method="POST"
                )
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = response.read().decode('utf-8')
                    logger.info(f"Email sent via Resend API successfully: {res_body}")
                    num_sent += 1
            except urllib.error.HTTPError as e:
                err_content = e.read().decode('utf-8')
                logger.error(f"Resend API HTTP error: {e.code} - {err_content}")
                if not self.fail_silently:
                    raise ValueError(f"Resend API error: {err_content}")
            except Exception as e:
                logger.error(f"Failed to send email via Resend API: {str(e)}")
                if not self.fail_silently:
                    raise
        return num_sent
