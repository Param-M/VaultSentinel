from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from config import settings


def create_link_token(client_id: str, bank_name: str, email: str) -> str:
    """Creates a permanent JWT link token embedded in the access email."""
    payload = {
        "client_id": client_id,
        "bank_name": bank_name,
        "email": email,
        "purpose": "dashboard_access",
        "iat": int(datetime.utcnow().timestamp()),
    }
    return jwt.encode(payload, settings.link_token_secret, algorithm=settings.jwt_algorithm)


def create_session_token(client_id: str, bank_name: str, email: str, role: str) -> str:
    """Creates a session JWT after successful password login."""
    expire = datetime.utcnow() + timedelta(hours=settings.session_expire_hours)
    payload = {
        "client_id": client_id,
        "bank_name": bank_name,
        "email": email,
        "role": role,
        "exp": expire,
        "type": "session",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_token(token: str, secret: str) -> Optional[dict]:
    """Verifies a JWT and returns its payload, or None if invalid."""
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None


def verify_link_token(token: str) -> Optional[dict]:
    return verify_token(token, settings.link_token_secret)


def verify_session_token(token: str) -> Optional[dict]:
    return verify_token(token, settings.jwt_secret_key)
