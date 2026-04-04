"""
victim_server.py — Intentionally vulnerable FastAPI server on :8001.
Used as the attack target for the simulation engine.
DO NOT deploy this in production.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from faker import Faker
import uvicorn
import random

app = FastAPI(title="VulnerableBank API — Simulation Target")
fake = Faker("en_IN")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def fake_user():
    return {
        "user_id": fake.uuid4(),
        "name": fake.name(),
        "email": fake.email(),
        "pan": fake.bothify("?????####?"),
        "aadhaar": fake.numerify("####-####-####"),
        "account_number": fake.numerify("################"),
        "balance": round(random.uniform(1000, 500000), 2),
        "ifsc": fake.bothify("????0######"),
    }


# ─── Zombie/Ghost APIs (vulnerable by design) ────────────────────────────────

@app.get("/api/v0/user-data")
def get_user_data(limit: int = 10):
    """GHOST — No auth, returns PAN + Aadhaar. Score: 99/100."""
    return [fake_user() for _ in range(min(limit, 100))]


@app.get("/api/v0/users")
def list_users():
    """ZOMBIE — No auth, stale endpoint. Score: 78/100."""
    return {"users": [fake_user() for _ in range(5)], "deprecated": True}


@app.get("/api/internal/admin")
def admin_panel():
    """GHOST — Internal admin endpoint exposed publicly. Score: 95/100."""
    return {"admin": True, "db_host": "postgres:5432", "secret_key": "change-me-123"}


@app.get("/api/v0/transactions")
def get_transactions():
    """ZOMBIE — Old transaction API with no rate limiting."""
    return [
        {
            "txn_id": fake.uuid4(),
            "amount": round(random.uniform(100, 50000), 2),
            "from_account": fake.numerify("################"),
            "to_account": fake.numerify("################"),
            "timestamp": fake.date_time_this_year().isoformat(),
        }
        for _ in range(20)
    ]


@app.post("/api/v0/users/profile")
def update_profile(body: dict = {}):
    """ZOMBIE — Mass assignment vulnerability."""
    return {"status": "updated", "applied": body}


@app.get("/api/v1/kyc")
def kyc_data():
    """DORMANT — KYC endpoint, last called 45 days ago."""
    return {"kyc_status": "VERIFIED", "pan": fake.bothify("?????####?"), "verified_at": "2024-01-15"}


@app.get("/api/v0/health")
def old_health():
    """Old version health check — should be /api/v2/health."""
    return {"status": "ok", "version": "0.1.0", "debug": True}


# ─── Active (safe) APIs ───────────────────────────────────────────────────────

@app.get("/api/v2/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    print("\n🎯 Vault Sentinel — Victim Server running on http://localhost:8001")
    print("   This is the attack simulation target. Do NOT use in production.\n")
    uvicorn.run(app, host="0.0.0.0", port=8001)
