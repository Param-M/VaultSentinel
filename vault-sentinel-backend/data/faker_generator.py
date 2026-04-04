"""
faker_generator.py — Generates realistic API gateway logs and OpenAPI spec.
Run: python data/faker_generator.py
Output: data/sample_logs/gateway_logs.txt + data/sample_logs/openapi_spec.json
"""
import random
import json
import os
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()
random.seed(42)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "sample_logs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 60% documented, 40% undocumented (zombie candidates)
DOCUMENTED_ENDPOINTS = [
    "/api/v2/accounts",
    "/api/v2/transactions",
    "/api/v2/users/profile",
    "/api/v2/kyc/status",
    "/api/v2/cards",
    "/api/v2/loans",
    "/api/v2/health",
    "/api/v2/auth/token",
    "/api/v2/notifications",
    "/api/v2/statements",
]

ZOMBIE_ENDPOINTS = [
    "/api/v0/user-data",           # GHOST — no auth, PAN data
    "/api/v0/users",               # ZOMBIE — deprecated
    "/api/v0/transactions",        # ZOMBIE — deprecated
    "/api/v1/kyc",                 # DORMANT — old version
    "/api/internal/admin",         # GHOST — internal exposed
    "/api/v1/cards/legacy",        # ZOMBIE — stale
    "/api/debug/config",           # GHOST — debug endpoint
    "/api/v0/balance",             # DORMANT — old balance API
    "/api/v1/payments/old",        # DORMANT — deprecated payments
    "/api/internal/metrics",       # ZOMBIE — internal metrics exposed
]

METHODS = ["GET", "GET", "GET", "POST", "GET", "PUT", "DELETE", "GET"]


def random_timestamp(days_ago_max: int, days_ago_min: int = 0) -> str:
    delta = timedelta(
        days=random.randint(days_ago_min, days_ago_max),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
        seconds=random.randint(0, 59),
    )
    ts = datetime.utcnow() - delta
    return ts.strftime("%Y-%m-%dT%H:%M:%S")


def generate_logs(n: int = 10000) -> list:
    lines = []
    for _ in range(n):
        # 70% documented traffic, 30% zombie traffic
        if random.random() < 0.7:
            endpoint = random.choice(DOCUMENTED_ENDPOINTS)
            days_ago = random.randint(0, 7)  # recent
        else:
            endpoint = random.choice(ZOMBIE_ENDPOINTS)
            # Ghost/zombie endpoints — older traffic with some recent spikes
            if endpoint in ["/api/v0/user-data", "/api/internal/admin"]:
                days_ago = random.randint(0, 3)  # recently active = GHOST
            else:
                days_ago = random.randint(45, 400)  # stale = ZOMBIE/DORMANT

        method = random.choice(METHODS)
        status = random.choices(
            [200, 200, 200, 201, 400, 401, 403, 404, 500],
            weights=[50, 10, 10, 5, 8, 5, 5, 5, 2]
        )[0]
        response_time = random.randint(20, 2000)
        ip = fake.ipv4()
        timestamp = random_timestamp(days_ago_max=days_ago + 1, days_ago_min=days_ago)

        lines.append(f"{timestamp} {method} {endpoint} {status} {response_time} {ip}")
    return lines


def generate_openapi_spec() -> dict:
    """Only documents the 'clean' endpoints — zombies are undocumented."""
    paths = {}
    for ep in DOCUMENTED_ENDPOINTS:
        paths[ep] = {
            "get": {
                "summary": f"Endpoint {ep}",
                "security": [{"bearerAuth": []}],
                "responses": {"200": {"description": "Success"}},
            }
        }
    return {
        "openapi": "3.0.0",
        "info": {"title": "BankAPI", "version": "2.0.0"},
        "paths": paths,
        "components": {
            "securitySchemes": {
                "bearerAuth": {"type": "http", "scheme": "bearer"}
            }
        },
    }


if __name__ == "__main__":
    print("Generating 10,000 gateway log lines...")
    logs = generate_logs(10000)
    log_path = os.path.join(OUTPUT_DIR, "gateway_logs.txt")
    with open(log_path, "w") as f:
        f.write("\n".join(logs))
    print(f"✓ Logs written to {log_path}")

    print("Generating OpenAPI spec (60% coverage — 40% undocumented)...")
    spec = generate_openapi_spec()
    spec_path = os.path.join(OUTPUT_DIR, "openapi_spec.json")
    with open(spec_path, "w") as f:
        json.dump(spec, f, indent=2)
    print(f"✓ OpenAPI spec written to {spec_path}")
    print(f"\nUndocumented zombie endpoints ({len(ZOMBIE_ENDPOINTS)}):")
    for ep in ZOMBIE_ENDPOINTS:
        print(f"  {ep}")
