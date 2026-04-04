"""
seed.py — Creates the hackathon demo account and sends both emails to the judge.
Run: python data/seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, Base, engine
from models.db_models import Client
from auth.jwt_handler import create_link_token
from auth.password import hash_password
from services.email_svc import send_access_link, send_credentials
import uuid

Base.metadata.create_all(bind=engine)

DEMO_CLIENT_ID = "sbi-demo-001"
DEMO_BANK_NAME = "SBI Demo Bank"
DEMO_EMAIL = "demo@vaultsentinel.com"
DEMO_PASSWORD = "Hackathon@2026"


def seed(judge_email: str = None):
    db = SessionLocal()

    # Remove existing demo account if present
    existing = db.query(Client).filter(Client.client_id == DEMO_CLIENT_ID).first()
    if existing:
        db.delete(existing)
        db.commit()

    # Create demo client
    client = Client(
        client_id=DEMO_CLIENT_ID,
        bank_name=DEMO_BANK_NAME,
        email=DEMO_EMAIL,
        hashed_password=hash_password(DEMO_PASSWORD),
        role="security_team",
    )
    db.add(client)
    db.commit()

    # Generate link token
    link_token = create_link_token(DEMO_CLIENT_ID, DEMO_BANK_NAME, DEMO_EMAIL)

    print("\n" + "="*60)
    print("VAULT SENTINEL — DEMO SEED COMPLETE")
    print("="*60)
    print(f"Demo Email:    {DEMO_EMAIL}")
    print(f"Demo Password: {DEMO_PASSWORD}")
    print(f"Dashboard URL: http://localhost:5173/login?lt={link_token}")
    print("="*60)

    # Send to judge email if provided
    target = judge_email or DEMO_EMAIL
    print(f"\nSending emails to: {target}")

    ok1 = send_access_link(target, DEMO_BANK_NAME, link_token)
    ok2 = send_credentials(target, DEMO_BANK_NAME, DEMO_PASSWORD)

    print(f"Email 1 (Access Link): {'✓ Sent' if ok1 else '✗ Failed (check SMTP config)'}")
    print(f"Email 2 (Credentials): {'✓ Sent' if ok2 else '✗ Failed (check SMTP config)'}")
    print("\nRun the victim server: python data/victim_server.py")
    print("Start the backend:     uvicorn main:app --reload")

    db.close()


if __name__ == "__main__":
    judge = input("Enter judge email (leave blank for default demo email): ").strip()
    seed(judge or None)
