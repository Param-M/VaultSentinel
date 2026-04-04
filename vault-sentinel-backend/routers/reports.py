from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from models.db_models import APIEndpoint, Client
from services.report_svc import generate_rbi_pdf, generate_pci_pdf

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/rbi")
def get_rbi_report(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    endpoints = db.query(APIEndpoint).filter(
        APIEndpoint.client_id == current_user["client_id"]
    ).all()

    pdf_bytes = generate_rbi_pdf(current_user["bank_name"], endpoints)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="VaultSentinel_RBI_Report.pdf"'
        },
    )


@router.get("/pci")
def get_pci_report(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    endpoints = db.query(APIEndpoint).filter(
        APIEndpoint.client_id == current_user["client_id"]
    ).all()

    pdf_bytes = generate_pci_pdf(current_user["bank_name"], endpoints)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="VaultSentinel_PCI_Report.pdf"'
        },
    )
