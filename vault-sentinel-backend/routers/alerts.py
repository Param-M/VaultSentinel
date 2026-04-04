"""
alerts.py — WebSocket real-time alerts + REST alert list.

WebSocket fix: the original used synchronous redis.pubsub() with a polling loop
(asyncio.sleep(0.5) between checks). This blocked the event loop and could drop
messages. Replaced with redis.asyncio for true async pub/sub.

Also broadcasts alerts via Redis when they are created so connected
WebSocket clients receive them instantly from any source (scan, quarantine, honeypot).
"""
import asyncio
import json
import logging
from typing import List

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from auth.jwt_handler import verify_session_token
from config import settings
from database import get_db
from models.db_models import Alert
from models.schemas import AlertOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/alerts", tags=["alerts"])

# Sync redis for REST endpoints, async redis for WebSocket
import redis as sync_redis
r_sync = sync_redis.from_url(settings.redis_url, decode_responses=True)


# ─── Helper: publish an alert to all connected WS clients ────────────────────

def publish_alert(client_id: str, alert_type: str, message: str, details: dict = None):
    """
    Call this whenever a new alert is created so connected WebSocket clients
    receive it instantly without waiting for the next poll.
    Used by: scanner.py, quarantine_svc.py, honeypot_svc.py
    """
    r_sync.publish(
        f"alerts:{client_id}",
        json.dumps({
            "type":    alert_type,
            "message": message,
            "details": details or {},
        })
    )


# ─── REST endpoints ───────────────────────────────────────────────────────────

@router.get("", response_model=List[AlertOut])
def list_alerts(
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Alert).filter(Alert.client_id == current_user["client_id"])
    if unread_only:
        query = query.filter(Alert.is_read == False)
    return query.order_by(Alert.created_at.desc()).limit(50).all()


@router.post("/{alert_id}/read")
def mark_read(
    alert_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.client_id == current_user["client_id"]
    ).first()
    if alert:
        alert.is_read = True
        db.commit()
    return {"status": "ok"}


@router.post("/mark-all-read")
def mark_all_read(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Alert).filter(
        Alert.client_id == current_user["client_id"],
        Alert.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"status": "ok"}


# ─── WebSocket endpoint ───────────────────────────────────────────────────────

@router.websocket("/ws")
async def alerts_websocket(websocket: WebSocket, token: str = ""):
    """
    WebSocket — pushes real-time events to the dashboard.

    Auth: JWT passed as ?token= query param (Bearer header not available in WS handshake).
    Messages: JSON objects from Redis pub/sub channel alerts:{client_id}

    Published by:
      - scheduler.py  → SCAN_COMPLETE
      - scanner.py    → GHOST_QUARANTINED, ZOMBIE_DETECTED
      - honeypot_svc  → HONEYPOT_HIT
      - Any call to publish_alert()

    Uses redis.asyncio for non-blocking pub/sub — no sleep polling.
    Sends a heartbeat ping every 25s to keep the connection alive through proxies.
    """
    # Authenticate
    payload = verify_session_token(token)
    if not payload:
        logger.warning("[ws] Rejected connection — invalid token")
        await websocket.close(code=4001)
        return

    client_id = payload["client_id"]
    await websocket.accept()
    logger.info(f"[ws] Client connected: {client_id}")

    # Create async Redis connection for this WebSocket session
    aredis = aioredis.from_url(settings.redis_url, decode_responses=True)
    pubsub = aredis.pubsub()
    await pubsub.subscribe(f"alerts:{client_id}")

    # Send a connected confirmation immediately
    await websocket.send_text(json.dumps({
        "type": "CONNECTED",
        "client_id": client_id,
        "message": "WebSocket connected — real-time alerts active",
    }))

    try:
        heartbeat_counter = 0
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue

            # Forward the Redis message to the WebSocket client
            await websocket.send_text(message["data"])

            # Heartbeat every ~50 messages (≈25s at scheduler pace)
            heartbeat_counter += 1
            if heartbeat_counter % 50 == 0:
                await websocket.send_text(json.dumps({"type": "PING"}))

    except WebSocketDisconnect:
        logger.info(f"[ws] Client disconnected: {client_id}")
    except Exception as e:
        logger.error(f"[ws] Error for {client_id}: {e}")
    finally:
        await pubsub.unsubscribe(f"alerts:{client_id}")
        await aredis.aclose()
