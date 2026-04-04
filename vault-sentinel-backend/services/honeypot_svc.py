"""
honeypot_svc.py — Dynamic honeypot (decoy) endpoint deployment.
Any request to a honeypot = guaranteed malicious. Zero false positives.
"""
import redis
import json
from faker import Faker
from datetime import datetime
from config import settings
from models.db_models import HoneypotHit, APIEndpoint
from sqlalchemy.orm import Session

r = redis.from_url(settings.redis_url, decode_responses=True)
fake = Faker("en_IN")

HONEYPOT_PREFIX = "honeypot:"


def deploy_honeypot(endpoint: str, client_id: str) -> dict:
    """
    Registers a honeypot for the given endpoint in Redis.
    The endpoint is quarantined — any future hit is logged as attacker.
    """
    key = f"{HONEYPOT_PREFIX}{endpoint}"
    r.hset(key, mapping={
        "client_id": client_id,
        "deployed_at": datetime.utcnow().isoformat(),
        "hit_count": 0,
    })
    return {
        "honeypot_endpoint": endpoint,
        "status": "DEPLOYED",
        "message": f"Honeypot active at {endpoint}. All future requests will be captured.",
    }


def is_honeypot(endpoint: str) -> bool:
    return r.exists(f"{HONEYPOT_PREFIX}{endpoint}") > 0


def log_hit(
    endpoint: str,
    attacker_ip: str,
    method: str,
    headers: dict,
    body: str,
    db: Session,
    client_id: str,
) -> HoneypotHit:
    """Records a honeypot hit in DB and increments Redis counter."""
    key = f"{HONEYPOT_PREFIX}{endpoint}"
    r.hincrby(key, "hit_count", 1)

    hit = HoneypotHit(
        client_id=client_id,
        honeypot_endpoint=endpoint,
        attacker_ip=attacker_ip,
        attacker_method=method,
        attacker_headers=headers,
        attacker_body=body,
        captured_at=datetime.utcnow(),
    )
    db.add(hit)
    db.commit()
    db.refresh(hit)
    return hit


def fake_response(endpoint: str) -> dict:
    """
    Returns convincing fake banking data to keep attacker engaged longer.
    The data is entirely synthetic — no real records exposed.
    """
    return {
        "status": "success",
        "data": {
            "account_id": fake.uuid4(),
            "account_number": fake.numerify("################"),
            "ifsc": fake.bothify("????0######"),
            "balance": round(fake.pyfloat(min_value=1000, max_value=500000), 2),
            "holder_name": fake.name(),
            "pan": fake.bothify("?????####?"),
            "last_transaction": fake.date_time_this_month().isoformat(),
        },
        "_vault_sentinel": "HONEYPOT_CAPTURE_ACTIVE",
    }


def get_honeypot_stats(client_id: str, db: Session) -> dict:
    keys = r.keys(f"{HONEYPOT_PREFIX}*")
    total_honeypots = len(keys)
    total_hits = db.query(HoneypotHit).filter(HoneypotHit.client_id == client_id).count()
    today = datetime.utcnow().date()
    hits_today = db.query(HoneypotHit).filter(
        HoneypotHit.client_id == client_id,
        HoneypotHit.captured_at >= datetime.combine(today, datetime.min.time()),
    ).count()
    return {
        "total_honeypots": total_honeypots,
        "total_hits": total_hits,
        "hits_today": hits_today,
    }
