"""
scheduler.py — Background scan scheduler using asyncio.

Runs a full scan for ALL active clients every SCAN_INTERVAL_MINUTES.
No Celery required — runs inside the FastAPI process via lifespan.

Schedule (configurable in .env):
  SCAN_INTERVAL_MINUTES=5   →  scan every 5 minutes
  SCAN_INTERVAL_MINUTES=60  →  scan every hour

The scheduler:
  - Runs immediately on startup (so dashboard has data on first load)
  - Then repeats every interval
  - Pushes real-time alerts to Redis pub/sub after each scan
  - Logs scan results with timing
  - Never crashes the app — all exceptions caught and logged
"""
import asyncio
import logging
import redis
import json
from datetime import datetime
from database import SessionLocal
from models.db_models import Client
from services.scanner import run_scan
from config import settings

logger = logging.getLogger(__name__)

r = redis.from_url(settings.redis_url, decode_responses=True)

# Default: scan every 5 minutes. Override in .env
SCAN_INTERVAL_SECONDS = getattr(settings, "scan_interval_minutes", 5) * 60


async def _scan_all_clients():
    """Run a scan for every active client and push alerts to Redis pub/sub."""
    db = SessionLocal()
    try:
        clients = db.query(Client).filter(Client.is_active == True).all()
        logger.info(f"[scheduler] Starting scheduled scan for {len(clients)} client(s)")

        for client in clients:
            try:
                result = await run_scan(client.client_id, db, triggered_by="scheduler")

                # Push scan-complete event to WebSocket subscribers
                r.publish(
                    f"alerts:{client.client_id}",
                    json.dumps({
                        "type":   "SCAN_COMPLETE",
                        "data":   result,
                        "ts":     datetime.utcnow().isoformat(),
                    })
                )
                logger.info(
                    f"[scheduler] {client.client_id}: "
                    f"{result.get('total_apis_scanned',0)} APIs, "
                    f"{result.get('zombie_count',0)} zombies, "
                    f"{result.get('ghost_count',0)} ghosts "
                    f"({result.get('scan_duration_ms',0)}ms)"
                )
            except Exception as e:
                logger.error(f"[scheduler] Scan failed for {client.client_id}: {e}")

    except Exception as e:
        logger.error(f"[scheduler] Failed to load clients: {e}")
    finally:
        db.close()


async def run_scheduler():
    """
    Main scheduler loop. Call from FastAPI lifespan context.
    Runs immediately on startup, then every SCAN_INTERVAL_SECONDS.
    """
    logger.info(
        f"[scheduler] Auto-scan started — interval: "
        f"{SCAN_INTERVAL_SECONDS // 60}min ({SCAN_INTERVAL_SECONDS}s)"
    )

    # Run immediately on startup so the dashboard has data right away
    await asyncio.sleep(3)   # brief delay to let DB init complete
    await _scan_all_clients()

    # Then repeat on schedule
    while True:
        await asyncio.sleep(SCAN_INTERVAL_SECONDS)
        await _scan_all_clients()
