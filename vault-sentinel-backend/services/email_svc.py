"""
email_svc.py — Gmail SMTP email delivery.
Sends Email 1 (link) and Email 2 (credentials) as separate messages.

─── GMAIL SETUP (REQUIRED) ──────────────────────────────────────────────────
Gmail blocked plain passwords for SMTP in 2022.
You MUST use a Gmail App Password — NOT your normal Gmail password.

Steps:
  1. Go to myaccount.google.com → Security
  2. Enable 2-Step Verification (required for App Passwords)
  3. Search "App passwords" in the search bar
  4. Create a new App Password → Select "Mail" + "Other (Custom name)"
  5. Copy the 16-character code (e.g. abcd efgh ijkl mnop)
  6. Paste it (without spaces) into .env as SMTP_PASSWORD=abcdefghijklmnop

In .env:
  SMTP_USERNAME=youremail@gmail.com
  SMTP_PASSWORD=abcdefghijklmnop     ← 16-char App Password, NOT your Gmail password
  FROM_EMAIL=youremail@gmail.com

─── CONSOLE FALLBACK ────────────────────────────────────────────────────────
If SMTP is not configured, emails are printed to the console so the hackathon
demo still works without any email setup.
─────────────────────────────────────────────────────────────────────────────
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings

logger = logging.getLogger(__name__)

# Detect if SMTP is actually configured
def _smtp_configured() -> bool:
    return bool(
        settings.smtp_username
        and settings.smtp_password
        and settings.smtp_username not in ("", "your-email@gmail.com")
        and settings.smtp_password not in ("", "your-app-password")
    )


def _console_fallback(to_email: str, subject: str, plain_text: str):
    """Prints email to console when SMTP is not configured."""
    print("\n" + "━" * 60)
    print(f"📧  EMAIL (console fallback — SMTP not configured)")
    print(f"    To:      {to_email}")
    print(f"    Subject: {subject}")
    print(f"    Body:\n{plain_text}")
    print("━" * 60 + "\n")


def _send(to_email: str, subject: str, html_body: str, plain_text: str = "") -> bool:
    """
    Sends an email via Gmail SMTP using an App Password.
    Falls back to console output if SMTP is not configured.
    """
    if not _smtp_configured():
        logger.warning("[email_svc] SMTP not configured — printing to console instead")
        _console_fallback(to_email, subject, plain_text or "[HTML email — see html_body]")
        return True   # Return True so seed.py flow continues

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_username   # Use smtp_username as From (Gmail requires this)
        msg["To"] = to_email
        if plain_text:
            msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            # Use smtp_username here — Gmail requires From == authenticated user
            server.login(settings.smtp_username, settings.smtp_password)
            server.sendmail(settings.smtp_username, to_email, msg.as_string())

        logger.info(f"[email_svc] Sent '{subject}' to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print(
            "\n[email_svc] ✗ Gmail authentication failed.\n"
            "  Your SMTP_PASSWORD must be a Gmail App Password, NOT your normal Gmail password.\n"
            "  Steps: myaccount.google.com → Security → 2-Step Verification → App passwords\n"
            "  Create one for 'Mail', copy the 16-char code, paste into .env as SMTP_PASSWORD\n"
        )
        _console_fallback(to_email, subject, plain_text)
        return False

    except smtplib.SMTPException as e:
        print(f"[email_svc] SMTP error sending to {to_email}: {e}")
        _console_fallback(to_email, subject, plain_text)
        return False

    except Exception as e:
        print(f"[email_svc] Unexpected error sending to {to_email}: {e}")
        _console_fallback(to_email, subject, plain_text)
        return False


def send_access_link(to_email: str, bank_name: str, link_token: str) -> bool:
    """Email 1 — contains the private dashboard link."""
    dashboard_url = f"{settings.app_base_url}/login?lt={link_token}"

    plain = (
        f"Hello {bank_name} security team,\n\n"
        f"Your private Vault Sentinel dashboard is ready.\n\n"
        f"Access your dashboard here:\n{dashboard_url}\n\n"
        f"Do not share this link. Your login credentials will arrive in a separate email.\n"
        f"Without both the link AND credentials, the dashboard cannot be accessed.\n\n"
        f"— Vault Sentinel Team"
    )

    html = f"""<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0a0f1e;color:#e2e8f0;margin:0;padding:40px;">
  <div style="max-width:600px;margin:0 auto;background:#111827;border:1px solid #1e3a5f;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0f2340,#1a3a5c);padding:32px;text-align:center;">
      <h1 style="color:#00d4ff;margin:0;font-size:28px;letter-spacing:2px;">⬡ VAULT SENTINEL</h1>
      <p style="color:#64748b;margin:8px 0 0;font-size:13px;">Because every door in your bank deserves a guardian.</p>
    </div>
    <div style="padding:40px;">
      <p style="color:#94a3b8;margin:0 0 8px;">Hello <strong style="color:#e2e8f0;">{bank_name}</strong> security team,</p>
      <p style="color:#64748b;line-height:1.7;">
        Your private Vault Sentinel dashboard has been configured following your call with our team.
        Click below to access it — this link is unique to your organisation.
      </p>
      <div style="text-align:center;margin:40px 0;">
        <a href="{dashboard_url}"
           style="background:linear-gradient(135deg,#0066cc,#00d4ff);color:white;padding:16px 40px;
                  border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;
                  display:inline-block;letter-spacing:1px;">
          Access Your Dashboard →
        </a>
      </div>
      <p style="color:#475569;font-size:13px;margin:0;">
        Or copy this link:<br>
        <span style="color:#00d4ff;word-break:break-all;font-size:12px;">{dashboard_url}</span>
      </p>
      <hr style="border:none;border-top:1px solid #1e3a5f;margin:32px 0;">
      <p style="color:#475569;font-size:12px;margin:0;">
        🔒 Do not share this link. Your login credentials will arrive in a separate email.<br>
        Without both the link AND credentials, the dashboard cannot be accessed.
      </p>
    </div>
  </div>
</body>
</html>"""
    return _send(to_email, "Your Vault Sentinel Dashboard is Ready", html, plain)


def send_credentials(to_email: str, bank_name: str, password: str) -> bool:
    """Email 2 — contains only the password (link is in Email 1)."""
    plain = (
        f"Hello {bank_name} security team,\n\n"
        f"Your Vault Sentinel login credentials are below.\n"
        f"Use these together with the access link sent in our previous email.\n\n"
        f"  Email:    {to_email}\n"
        f"  Password: {password}\n\n"
        f"Please do not share these credentials.\n"
        f"If you need a new access link, contact your account manager.\n\n"
        f"— Vault Sentinel Team"
    )

    html = f"""<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0a0f1e;color:#e2e8f0;margin:0;padding:40px;">
  <div style="max-width:600px;margin:0 auto;background:#111827;border:1px solid #1e3a5f;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0f2340,#1a3a5c);padding:32px;text-align:center;">
      <h1 style="color:#00d4ff;margin:0;font-size:28px;letter-spacing:2px;">⬡ VAULT SENTINEL</h1>
      <p style="color:#64748b;margin:8px 0 0;font-size:13px;">Login Credentials</p>
    </div>
    <div style="padding:40px;">
      <p style="color:#94a3b8;margin:0 0 8px;">Hello <strong style="color:#e2e8f0;">{bank_name}</strong> security team,</p>
      <p style="color:#64748b;line-height:1.7;">
        Your Vault Sentinel login credentials are below. Use these with the access link sent in our previous email.
      </p>
      <div style="background:#0a0f1e;border:1px solid #1e3a5f;border-radius:8px;padding:24px;margin:32px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#64748b;font-size:13px;padding:10px 0;width:90px;">Email</td>
            <td style="color:#00d4ff;font-family:monospace;font-size:14px;">{to_email}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:10px 0;">Password</td>
            <td style="color:#00d4ff;font-family:monospace;font-size:20px;font-weight:bold;letter-spacing:2px;">{password}</td>
          </tr>
        </table>
      </div>
      <p style="color:#475569;font-size:12px;">
        🔐 Please do not share these credentials.<br>
        If you need a new access link, contact your Vault Sentinel account manager.
      </p>
    </div>
  </div>
</body>
</html>"""
    return _send(to_email, "Your Vault Sentinel Login Credentials", html, plain)


def send_demo_notification(name: str, email: str, bank_name: str) -> bool:
    """Notifies the Vault Sentinel team about a new demo request."""
    plain = f"New demo request\nName: {name}\nBank: {bank_name}\nEmail: {email}"
    html = f"""<html><body style="font-family:Arial,sans-serif;">
<h2 style="color:#0066cc;">New Demo Request — Vault Sentinel</h2>
<p><b>Name:</b> {name}</p>
<p><b>Bank:</b> {bank_name}</p>
<p><b>Email:</b> {email}</p>
</body></html>"""
    return _send(settings.smtp_username or email, f"Demo Request: {bank_name}", html, plain)
