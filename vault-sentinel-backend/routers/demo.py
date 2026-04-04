from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import DemoBookRequest
from models.db_models import DemoRequest
from services.email_svc import send_demo_notification

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/book")
def book_demo(request: DemoBookRequest, db: Session = Depends(get_db)):
    """Saves a demo booking request and notifies the team."""
    demo = DemoRequest(
        name=request.name,
        email=request.email,
        bank_name=request.bank_name,
        phone=request.phone,
        message=request.message,
    )
    db.add(demo)
    db.commit()

    send_demo_notification(request.name, request.email, request.bank_name)

    return {
        "status": "BOOKED",
        "message": "Thank you! Our team will reach out within 24 hours to schedule your demo.",
    }
