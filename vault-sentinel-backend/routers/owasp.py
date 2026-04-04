from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from models.schemas import OWASPScanResponse, OWASPResult
from models.db_models import APIEndpoint
from services.owasp import run_full_scan
from config import settings

router = APIRouter(prefix="/owasp", tags=["owasp"])


@router.post("/scan/{endpoint_id}", response_model=OWASPScanResponse)
async def run_owasp_scan(
    endpoint_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run all 10 OWASP rules against an endpoint."""
    ep = db.query(APIEndpoint).filter(
        APIEndpoint.id == endpoint_id,
        APIEndpoint.client_id == current_user["client_id"]
    ).first()

    if not ep:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    # Run against victim server base URL
    results_raw = await run_full_scan(settings.victim_server_url, ep.endpoint)
    results = [OWASPResult(**r) for r in results_raw]

    # Save results to DB
    import json
    ep.owasp_results = [r.dict() for r in results]
    db.commit()

    return OWASPScanResponse(
        endpoint=ep.endpoint,
        results=results,
        pass_count=sum(1 for r in results if r.status == "PASS"),
        fail_count=sum(1 for r in results if r.status == "FAIL"),
        warn_count=sum(1 for r in results if r.status == "WARN"),
    )
