from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from models.schemas import QuarantineRequest, QuarantineStatus
from models.db_models import APIEndpoint
from services import quarantine_svc

router = APIRouter(prefix="/quarantine", tags=["quarantine"])


@router.get("")
def list_quarantined(current_user: dict = Depends(get_current_user)):
    """Returns all currently quarantined endpoints."""
    return quarantine_svc.list_quarantined()


@router.post("")
def quarantine_endpoint(
    request: QuarantineRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually quarantine an endpoint."""
    quarantine_svc.block_endpoint(request.endpoint, request.reason or "Manual quarantine")

    # Update DB record
    ep = db.query(APIEndpoint).filter(
        APIEndpoint.endpoint == request.endpoint,
        APIEndpoint.client_id == current_user["client_id"]
    ).first()
    if ep:
        ep.is_quarantined = True
        db.commit()

    return {"status": "QUARANTINED", "endpoint": request.endpoint}


@router.delete("/{endpoint:path}")
def unquarantine_endpoint(
    endpoint: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove an endpoint from quarantine."""
    endpoint = "/" + endpoint
    removed = quarantine_svc.unblock(endpoint)

    ep = db.query(APIEndpoint).filter(
        APIEndpoint.endpoint == endpoint,
        APIEndpoint.client_id == current_user["client_id"]
    ).first()
    if ep:
        ep.is_quarantined = False
        db.commit()

    return {"status": "UNQUARANTINED" if removed else "NOT_FOUND", "endpoint": endpoint}


@router.get("/check/{endpoint:path}", response_model=QuarantineStatus)
def check_status(endpoint: str, current_user: dict = Depends(get_current_user)):
    """Check if a specific endpoint is quarantined."""
    endpoint = "/" + endpoint
    return quarantine_svc.get_quarantine_info(endpoint)
