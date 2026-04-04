from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.jwt_handler import verify_session_token

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """FastAPI dependency: validates the session JWT and injects the user dict."""
    token = credentials.credentials
    payload = verify_session_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "session":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    return {
        "client_id": payload["client_id"],
        "bank_name": payload["bank_name"],
        "email": payload["email"],
        "role": payload["role"],
    }
