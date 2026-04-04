from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import LoginRequest, LoginResponse, VerifyLinkTokenResponse, UserOut
from models.db_models import Client
from auth.jwt_handler import verify_link_token, create_session_token
from auth.password import verify_password
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/verify-link-token", response_model=VerifyLinkTokenResponse)
def verify_link_token_endpoint(lt: str, db: Session = Depends(get_db)):
    """
    Called by the React login page on mount.
    Decodes the link token, verifies the client exists, returns email & bank_name.
    """
    payload = verify_link_token(lt)
    if not payload:
        return VerifyLinkTokenResponse(
            valid=False,
            message="This link is invalid or has been revoked. Contact your account manager."
        )

    client = db.query(Client).filter(
        Client.client_id == payload.get("client_id"),
        Client.is_active == True
    ).first()

    if not client:
        return VerifyLinkTokenResponse(
            valid=False,
            message="This link is invalid or has been revoked. Contact your account manager."
        )

    return VerifyLinkTokenResponse(
        valid=True,
        email=client.email,
        bank_name=client.bank_name,
        client_id=client.client_id,
    )


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Validates link token + password. Returns session JWT on success.
    """
    # Step 1: Verify link token
    link_payload = verify_link_token(request.link_token)
    if not link_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked access link."
        )

    # Step 2: Find client
    client = db.query(Client).filter(
        Client.email == request.email,
        Client.is_active == True
    ).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )

    # Step 3: Verify password
    if not verify_password(request.password, client.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )

    # Step 4: Issue session JWT
    session_token = create_session_token(
        client_id=client.client_id,
        bank_name=client.bank_name,
        email=client.email,
        role=client.role,
    )

    return LoginResponse(
        access_token=session_token,
        client_id=client.client_id,
        bank_name=client.bank_name,
        email=client.email,
        role=client.role,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the currently authenticated user's info."""
    client = db.query(Client).filter(
        Client.client_id == current_user["client_id"]
    ).first()

    if not client:
        raise HTTPException(status_code=404, detail="User not found")

    return client
