from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from database import get_db
from models.schemas import CreateClientRequest, CreateClientResponse
from models.db_models import Client
from auth.jwt_handler import create_link_token
from auth.password import hash_password
from services.email_svc import send_access_link, send_credentials

router = APIRouter(prefix="/admin", tags=["admin"])

# Simple hardcoded admin check — in prod, use a proper admin role
ADMIN_KEY = "vault-sentinel-admin-2026"


def require_admin(x_admin_key: str = ""):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.post("/clients", response_model=CreateClientResponse)
def create_client(
    request: CreateClientRequest,
    x_admin_key: str = "",
    db: Session = Depends(get_db),
):
    """
    Creates a new bank client account.
    Hashes password, generates link token, sends both emails.
    """
    require_admin(x_admin_key)

    # Check for duplicate email
    existing = db.query(Client).filter(Client.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate client_id if not provided
    client_id = request.client_id or f"client-{uuid.uuid4().hex[:8]}"

    # Create client
    client = Client(
        client_id=client_id,
        bank_name=request.bank_name,
        email=request.email,
        hashed_password=hash_password(request.password),
        role="security_team",
    )
    db.add(client)
    db.commit()

    # Generate link token
    link_token = create_link_token(
        client_id=client_id,
        bank_name=request.bank_name,
        email=request.email,
    )

    # Send both emails
    link_sent = send_access_link(request.email, request.bank_name, link_token)
    creds_sent = send_credentials(request.email, request.bank_name, request.password)

    return CreateClientResponse(
        client_id=client_id,
        bank_name=request.bank_name,
        email=request.email,
        link_sent=link_sent,
        credentials_sent=creds_sent,
    )


@router.post("/clients/{client_id}/resend")
def resend_emails(
    client_id: str,
    x_admin_key: str = "",
    db: Session = Depends(get_db),
):
    """Re-sends both access emails to an existing client."""
    require_admin(x_admin_key)

    client = db.query(Client).filter(Client.client_id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    link_token = create_link_token(client.client_id, client.bank_name, client.email)
    send_access_link(client.email, client.bank_name, link_token)

    return {"status": "emails_resent", "email": client.email}
