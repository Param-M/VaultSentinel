"""
apis.py — API endpoint management router.
Heavy scan logic has moved to services/scanner.py (optimised engine).
This router is now a thin HTTP layer.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from auth.dependencies import get_current_user
from models.schemas import APIEndpointOut, ScanRequest, PatchEndpointRequest, DashboardStats
from models.db_models import APIEndpoint, Alert, ScanHistory, HoneypotHit
from services.scanner import run_scan
from services.gemini_svc import explain_risk

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/apis", tags=["apis"])


@router.get("", response_model=List[APIEndpointOut])
def list_apis(
    risk_class: str = None,
    search: str = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all discovered API endpoints, optionally filtered by risk_class or search term."""
    query = db.query(APIEndpoint).filter(APIEndpoint.client_id == current_user["client_id"])
    if risk_class:
        query = query.filter(APIEndpoint.risk_class == risk_class.upper())
    if search:
        query = query.filter(APIEndpoint.endpoint.ilike(f"%{search}%"))
    return query.order_by(APIEndpoint.risk_score.desc()).all()


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dashboard overview statistics — called every 15s by the frontend."""
    client_id = current_user["client_id"]
    endpoints = db.query(APIEndpoint).filter(APIEndpoint.client_id == client_id).all()
    today = datetime.utcnow().date()

    hits_today = db.query(HoneypotHit).filter(
        HoneypotHit.client_id == client_id,
        HoneypotHit.captured_at >= datetime.combine(today, datetime.min.time()),
    ).count()

    last_scan = (
        db.query(ScanHistory)
        .filter(ScanHistory.client_id == client_id)
        .order_by(ScanHistory.created_at.desc())
        .first()
    )

    total = len(endpoints)
    active_count = sum(1 for e in endpoints if e.risk_class == "ACTIVE")
    avg_score = sum(e.risk_score for e in endpoints) / total if total else 0
    compliance = round((active_count / total * 100) if total else 100, 1)

    return DashboardStats(
        total_apis        = total,
        active_count      = active_count,
        dormant_count     = sum(1 for e in endpoints if e.risk_class == "DORMANT"),
        zombie_count      = sum(1 for e in endpoints if e.risk_class == "ZOMBIE"),
        ghost_count       = sum(1 for e in endpoints if e.risk_class == "GHOST"),
        quarantined_count = sum(1 for e in endpoints if e.is_quarantined),
        honeypot_hits_today = hits_today,
        avg_risk_score    = round(avg_score, 1),
        compliance_score  = compliance,
        last_scan         = last_scan.created_at if last_scan else None,
    )


@router.get("/history")
def scan_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Last 20 scan results — used by the dashboard timeline chart."""
    return (
        db.query(ScanHistory)
        .filter(ScanHistory.client_id == current_user["client_id"])
        .order_by(ScanHistory.created_at.desc())
        .limit(20)
        .all()
    )


@router.post("/scan")
async def trigger_scan(
    request: ScanRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manual scan trigger. Uses the same optimised scanner.py engine as the scheduler.
    Returns immediately with scan results (runs synchronously — fast enough for a demo).
    """
    result = await run_scan(
        client_id=current_user["client_id"],
        db=db,
        triggered_by="manual",
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.patch("/{endpoint_id}", response_model=APIEndpointOut)
def update_endpoint(
    endpoint_id: int,
    request: PatchEndpointRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ep = db.query(APIEndpoint).filter(
        APIEndpoint.id == endpoint_id,
        APIEndpoint.client_id == current_user["client_id"],
    ).first()
    if not ep:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    if request.owner_team  is not None: ep.owner_team  = request.owner_team
    if request.service_name is not None: ep.service_name = request.service_name
    db.commit()
    db.refresh(ep)
    return ep


@router.get("/{endpoint_id}/explain")
async def explain_endpoint(
    endpoint_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """On-demand Gemini AI risk summary for a single endpoint."""
    ep = db.query(APIEndpoint).filter(
        APIEndpoint.id == endpoint_id,
        APIEndpoint.client_id == current_user["client_id"],
    ).first()
    if not ep:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    summary = await explain_risk(
        endpoint=ep.endpoint, risk_score=ep.risk_score, risk_class=ep.risk_class,
        contributing_factors=[], cve_count=ep.cve_count,
        inactive_days=ep.inactive_days, auth_type=ep.auth_type,
        force_refresh=True,
    )
    ep.gemini_summary = summary
    db.commit()
    return {"endpoint": ep.endpoint, "summary": summary}
