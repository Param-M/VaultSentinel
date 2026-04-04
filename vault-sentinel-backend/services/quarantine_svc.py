"""
quarantine_svc.py — Block/unblock endpoints via Redis SET.
Redis key: quarantine:{endpoint} → reason
"""
import redis
from config import settings
from datetime import datetime

r = redis.from_url(settings.redis_url, decode_responses=True)

QUARANTINE_PREFIX = "quarantine:"


def block_endpoint(endpoint: str, reason: str = "Auto-quarantined by Vault Sentinel") -> bool:
    """Adds endpoint to Redis quarantine set. Returns True on success."""
    key = f"{QUARANTINE_PREFIX}{endpoint}"
    r.hset(key, mapping={
        "reason": reason,
        "blocked_at": datetime.utcnow().isoformat(),
    })
    return True


def unblock(endpoint: str) -> bool:
    """Removes endpoint from quarantine. Returns True if was blocked."""
    key = f"{QUARANTINE_PREFIX}{endpoint}"
    return r.delete(key) > 0


def is_blocked(endpoint: str) -> bool:
    """Fast check — used by middleware on every request."""
    return r.exists(f"{QUARANTINE_PREFIX}{endpoint}") > 0


def get_quarantine_info(endpoint: str) -> dict:
    """Returns quarantine metadata for an endpoint."""
    key = f"{QUARANTINE_PREFIX}{endpoint}"
    data = r.hgetall(key)
    return {
        "endpoint": endpoint,
        "is_blocked": bool(data),
        "reason": data.get("reason"),
        "blocked_at": data.get("blocked_at"),
    }


def list_quarantined() -> list:
    """Returns all currently quarantined endpoints."""
    keys = r.keys(f"{QUARANTINE_PREFIX}*")
    result = []
    for key in keys:
        endpoint = key.replace(QUARANTINE_PREFIX, "")
        data = r.hgetall(key)
        result.append({
            "endpoint": endpoint,
            "reason": data.get("reason"),
            "blocked_at": data.get("blocked_at"),
        })
    return result
