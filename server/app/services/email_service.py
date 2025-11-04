import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.core.security import create_email_verification_token


class EmailService:
    @staticmethod
    def send_verification_email(email: str):
        token = create_email_verification_token(email)
        verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"

        subject = "Verify your Sunflower account"
        body = f"""
        <html>
        <body>
            <p>Hello,</p>
            <p>Please click the link below to verify your email address. This link will expire in 30 minutes:</p>
            <p><a href="{verification_link}">{verification_link}</a></p>
            <p>If you didn’t request this, please ignore this email.</p>
            <br/>
            <p>– The Sunflower Team 🌻</p>
        </body>
        </html>
        """

        msg = MIMEMultipart()
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, email, msg.as_string())
            print(f"[EmailService] Verification email sent to {email}")
        except Exception as e:
            print(f"[EmailService] Failed to send email to {email}: {e}")
