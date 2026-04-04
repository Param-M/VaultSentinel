from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth.dependencies import get_current_user
from models.schemas import HoneypotDeployRequest, HoneypotHitOut
from models.db_models import HoneypotHit
from services import honeypot_svc

router = APIRouter(prefix="/honeypot", tags=["honeypot"])


@router.post("/deploy")
def deploy_honeypot(
    request: HoneypotDeployRequest,
    current_user: dict = Depends(get_current_user),
):
    """Deploy a honeypot at the given endpoint path."""
    return honeypot_svc.deploy_honeypot(
        endpoint=request.target_endpoint,
        client_id=current_user["client_id"],
    )


@router.get("/hits", response_model=List[HoneypotHitOut])
def get_hits(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all honeypot hits for the client."""
    return db.query(HoneypotHit).filter(
        HoneypotHit.client_id == current_user["client_id"]
    ).order_by(HoneypotHit.captured_at.desc()).limit(100).all()


@router.get("/stats")
def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return honeypot_svc.get_honeypot_stats(current_user["client_id"], db)
