"""
scanner.py — Core scan engine used by both the API router and the scheduler.

Key design points:
  - Single pandas groupby pass via compute_all_endpoint_stats() — O(n) not O(n²)
  - Concurrent Gemini summaries via asyncio.gather
  - Deduplicated alerts — no re-alerting the same endpoint every 5 min
  - Single DB commit per scan
  - Broadcasts SCAN_COMPLETE / ZOMBIE_DETECTED / GHOST_QUARANTINED via Redis → WebSocket
"""
import asyncio
import json
import logging
import time
from datetime import datetime

import redis as _redis
from sqlalchemy.orm import Session

from config import settings
from models.db_models import APIEndpoint, Alert, ScanHistory
from services.anomaly import detect_resurrection
from services.discovery import compute_all_endpoint_stats, find_undocumented, parse_logs
from services.gemini_svc import explain_risk
from services.quarantine_svc import block_endpoint
from services.scorer import calculate_score, classify

logger = logging.getLogger(__name__)

LOG_PATH     = "data/sample_logs/gateway_logs.txt"
OPENAPI_PATH = "data/sample_logs/openapi_spec.json"


# ─── Redis broadcast (sync — called from async context) ──────────────────────

def _broadcast(client_id: str, event_type: str, payload: dict):
    """Publish an event to the client's Redis pub/sub channel → WebSocket clients."""
    try:
        rc = _redis.from_url(settings.redis_url, decode_responses=True)
        rc.publish(f"alerts:{client_id}", json.dumps({"type": event_type, **payload}))
        rc.close()
    except Exception as e:
        logger.debug(f"[scanner] broadcast failed (non-fatal): {e}")


# ─── Main scan pipeline ───────────────────────────────────────────────────────

async def run_scan(client_id: str, db: Session, triggered_by: str = "manual") -> dict:
    """
    Full scan pipeline for one client. Steps:
      1. Parse gateway logs (pandas read_csv)
      2. Compute ALL endpoint stats in one groupby pass
      3. Score every endpoint (7-rule engine)
      4. Generate Gemini summaries concurrently for ZOMBIE/GHOST
      5. Upsert endpoints to DB
      6. Auto-quarantine GHOSTs (Redis SET + DB flag)
      7. Deduplicated alerts (won't re-alert same endpoint)
      8. Single DB commit
      9. Broadcast SCAN_COMPLETE via Redis → WebSocket
    """
    t0 = time.perf_counter()

    # ── 1. Parse ──────────────────────────────────────────────────────────────
    try:
        log_df = parse_logs(LOG_PATH)
    except FileNotFoundError:
        return {"error": "Gateway logs not found. Run: python data/faker_generator.py"}

    if log_df.empty:
        return {"error": "Log file is empty."}

    # ── 2. Bulk stats — single groupby pass ───────────────────────────────────
    all_stats = compute_all_endpoint_stats(log_df)
    undocumented_set = set(find_undocumented(log_df, OPENAPI_PATH))

    # ── 3. Score every endpoint ───────────────────────────────────────────────
    scored = []
    for endpoint, row in all_stats.iterrows():
        is_doc = str(endpoint) not in undocumented_set
        risk_score, reasons = calculate_score(
            inactive_days         = int(row["inactive_days"]),
            auth_type             = "none" if not is_doc else "bearer",
            cve_count             = 0,
            cvss_max              = 0.0,
            is_documented         = is_doc,
            has_owner             = is_doc,
            error_rate            = float(row["error_rate"]),
            resurrection_detected = bool(row["resurrection_signal"]),
        )
        scored.append({
            "endpoint":      str(endpoint),
            "method":        str(row.get("primary_method", "GET")).upper(),
            "is_doc":        is_doc,
            "risk_score":    risk_score,
            "risk_class":    classify(risk_score),
            "reasons":       reasons,
            "inactive_days": int(row["inactive_days"]),
            "error_rate":    float(row["error_rate"]),
            "call_count":    int(row["call_count"]),
            "unique_ips":    int(row["unique_ips"]),
            "resurrection":  bool(row["resurrection_signal"]),
        })

    # ── 4. Gemini summaries — concurrent ──────────────────────────────────────
    needs_summary = [s for s in scored if s["risk_class"] in ("ZOMBIE", "GHOST")]
    logger.info(f"[scanner] Generating {len(needs_summary)} Gemini summaries concurrently")

    async def _summarise(s: dict):
        try:
            return await explain_risk(
                endpoint=s["endpoint"], risk_score=s["risk_score"],
                risk_class=s["risk_class"], contributing_factors=s["reasons"],
                cve_count=0, inactive_days=s["inactive_days"],
                auth_type="none" if not s["is_doc"] else "bearer",
            )
        except Exception as e:
            logger.warning(f"[scanner] Gemini failed for {s['endpoint']}: {e}")
            return None

    summaries = await asyncio.gather(*[_summarise(s) for s in needs_summary])
    summary_map = {s["endpoint"]: sm for s, sm in zip(needs_summary, summaries)}

    # ── 5-7. Upsert + quarantine + deduplicated alerts ────────────────────────
    existing_alerted = {
        a.endpoint for a in db.query(Alert.endpoint).filter(
            Alert.client_id == client_id,
            Alert.alert_type.in_(["ZOMBIE_DETECTED", "GHOST_QUARANTINED"]),
        ).all()
    }

    new_eps = updated_eps = zombies = ghosts = quarantined = 0

    for s in scored:
        ep       = s["endpoint"]
        g_sum    = summary_map.get(ep)
        rc       = s["risk_class"]

        if rc == "ZOMBIE": zombies += 1
        if rc == "GHOST":  ghosts  += 1

        # Upsert
        existing = db.query(APIEndpoint).filter(
            APIEndpoint.client_id == client_id,
            APIEndpoint.endpoint  == ep,
        ).first()

        if existing:
            existing.risk_score            = s["risk_score"]
            existing.risk_class            = rc
            existing.is_documented         = s["is_doc"]
            existing.inactive_days         = s["inactive_days"]
            existing.resurrection_detected = s["resurrection"]
            existing.method                = s["method"]
            existing.updated_at            = datetime.utcnow()
            if g_sum:
                existing.gemini_summary = g_sum
            updated_eps += 1
        else:
            db.add(APIEndpoint(
                client_id             = client_id,
                endpoint              = ep,
                method                = s["method"],
                risk_score            = s["risk_score"],
                risk_class            = rc,
                is_documented         = s["is_doc"],
                auth_type             = "none" if not s["is_doc"] else "bearer",
                inactive_days         = s["inactive_days"],
                resurrection_detected = s["resurrection"],
                gemini_summary        = g_sum,
            ))
            new_eps += 1

        # Auto-quarantine GHOSTs
        if rc == "GHOST" and s["risk_score"] >= settings.quarantine_threshold:
            block_endpoint(ep, reason=f"Auto-quarantined: GHOST score {s['risk_score']:.0f}/100")
            if existing:
                existing.is_quarantined = True
            quarantined += 1

        # Deduplicated alerts
        if ep not in existing_alerted:
            if rc == "GHOST":
                db.add(Alert(
                    client_id=client_id, endpoint=ep,
                    alert_type="GHOST_QUARANTINED", severity="CRITICAL",
                    message=f"GHOST API auto-quarantined: {ep} (score {s['risk_score']:.0f}/100)",
                    details={"reasons": s["reasons"], "score": s["risk_score"], "ai_summary": g_sum},
                ))
                _broadcast(client_id, "GHOST_QUARANTINED", {
                    "endpoint": ep, "score": s["risk_score"], "message": f"GHOST quarantined: {ep}"
                })
            elif rc == "ZOMBIE":
                db.add(Alert(
                    client_id=client_id, endpoint=ep,
                    alert_type="ZOMBIE_DETECTED", severity="HIGH",
                    message=f"Zombie API detected: {ep} (score {s['risk_score']:.0f}/100)",
                    details={"reasons": s["reasons"], "score": s["risk_score"], "ai_summary": g_sum},
                ))
                _broadcast(client_id, "ZOMBIE_DETECTED", {
                    "endpoint": ep, "score": s["risk_score"], "message": f"Zombie detected: {ep}"
                })

    # ── 8. Single commit ──────────────────────────────────────────────────────
    elapsed_ms = int((time.perf_counter() - t0) * 1000)
    db.add(ScanHistory(
        client_id        = client_id,
        scan_type        = "scheduled" if triggered_by == "scheduler" else "full",
        total_apis       = len(scored),
        zombie_count     = zombies,
        ghost_count      = ghosts,
        avg_risk_score   = sum(s["risk_score"] for s in scored) / len(scored) if scored else 0,
        scan_duration_ms = elapsed_ms,
        triggered_by     = triggered_by,
    ))
    db.commit()

    # ── 9. Broadcast SCAN_COMPLETE ────────────────────────────────────────────
    result = {
        "status":             "SCAN_COMPLETE",
        "total_apis_scanned": len(scored),
        "new_endpoints":      new_eps,
        "updated_endpoints":  updated_eps,
        "zombie_count":       zombies,
        "ghost_count":        ghosts,
        "undocumented_count": len(undocumented_set),
        "auto_quarantined":   quarantined,
        "scan_duration_ms":   elapsed_ms,
        "triggered_by":       triggered_by,
    }
    _broadcast(client_id, "SCAN_COMPLETE", result)

    logger.info(
        f"[scanner] {client_id}: {len(scored)} APIs, "
        f"{zombies}Z {ghosts}G {quarantined}Q — {elapsed_ms}ms"
    )
    return result
