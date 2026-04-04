"""
owasp.py — Async OWASP Top 10 API Security scanner.
All 10 rules run concurrently via asyncio.gather.
"""
import asyncio
import httpx
from typing import List, Dict, Any


async def _check_broken_object_auth(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API1: Broken Object Level Authorization — test accessing other users' objects."""
    try:
        r = await client.get(f"{base_url}{endpoint.replace('{id}', '2')}", timeout=5)
        status = "FAIL" if r.status_code == 200 else "PASS"
        return {
            "rule_id": "API1",
            "rule_name": "Broken Object Level Authorization",
            "status": status,
            "detail": f"Cross-user access attempt returned {r.status_code}",
        }
    except Exception as e:
        return {"rule_id": "API1", "rule_name": "Broken Object Level Authorization", "status": "WARN", "detail": str(e)}


async def _check_broken_auth(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API2: Broken Authentication — test unauthenticated access."""
    try:
        r = await client.get(f"{base_url}{endpoint}", headers={}, timeout=5)
        status = "FAIL" if r.status_code not in [401, 403] else "PASS"
        return {
            "rule_id": "API2",
            "rule_name": "Broken Authentication",
            "status": status,
            "detail": f"Unauthenticated request returned {r.status_code}",
        }
    except Exception as e:
        return {"rule_id": "API2", "rule_name": "Broken Authentication", "status": "WARN", "detail": str(e)}


async def _check_excessive_data(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API3: Excessive Data Exposure — check if response contains sensitive fields."""
    sensitive_fields = ["password", "ssn", "pan", "aadhaar", "cvv", "secret", "private_key"]
    try:
        r = await client.get(f"{base_url}{endpoint}", timeout=5)
        body = r.text.lower()
        found = [f for f in sensitive_fields if f in body]
        status = "FAIL" if found else "PASS"
        return {
            "rule_id": "API3",
            "rule_name": "Excessive Data Exposure",
            "status": status,
            "detail": f"Sensitive fields found: {found}" if found else "No sensitive fields in response",
        }
    except Exception as e:
        return {"rule_id": "API3", "rule_name": "Excessive Data Exposure", "status": "WARN", "detail": str(e)}


async def _check_rate_limiting(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API4: Lack of Resources & Rate Limiting — send 20 rapid requests."""
    try:
        responses = await asyncio.gather(*[
            client.get(f"{base_url}{endpoint}", timeout=3) for _ in range(20)
        ], return_exceptions=True)
        status_codes = [r.status_code for r in responses if hasattr(r, "status_code")]
        rate_limited = any(s == 429 for s in status_codes)
        status = "PASS" if rate_limited else "FAIL"
        return {
            "rule_id": "API4",
            "rule_name": "Lack of Resources & Rate Limiting",
            "status": status,
            "detail": f"20 rapid requests: {'rate limiting active' if rate_limited else 'no rate limiting detected'}",
        }
    except Exception as e:
        return {"rule_id": "API4", "rule_name": "Lack of Resources & Rate Limiting", "status": "WARN", "detail": str(e)}


async def _check_function_auth(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API5: Broken Function Level Authorization — test admin endpoints."""
    admin_paths = ["/admin", "/internal", "/debug", "/actuator", "/metrics"]
    try:
        for path in admin_paths:
            r = await client.get(f"{base_url}{path}", timeout=3)
            if r.status_code == 200:
                return {
                    "rule_id": "API5",
                    "rule_name": "Broken Function Level Authorization",
                    "status": "FAIL",
                    "detail": f"Admin endpoint {path} accessible without auth (HTTP 200)",
                }
        return {"rule_id": "API5", "rule_name": "Broken Function Level Authorization", "status": "PASS", "detail": "No exposed admin endpoints found"}
    except Exception as e:
        return {"rule_id": "API5", "rule_name": "Broken Function Level Authorization", "status": "WARN", "detail": str(e)}


async def _check_mass_assignment(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API6: Mass Assignment — try injecting privileged fields in POST body."""
    try:
        r = await client.post(f"{base_url}{endpoint}", json={"role": "admin", "is_admin": True}, timeout=5)
        status = "FAIL" if r.status_code in [200, 201] else "PASS"
        return {
            "rule_id": "API6",
            "rule_name": "Mass Assignment",
            "status": status,
            "detail": f"Mass assignment attempt returned {r.status_code}",
        }
    except Exception as e:
        return {"rule_id": "API6", "rule_name": "Mass Assignment", "status": "WARN", "detail": str(e)}


async def _check_security_misconfig(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API7: Security Misconfiguration — check for debug headers, verbose errors."""
    try:
        r = await client.get(f"{base_url}{endpoint}", timeout=5)
        issues = []
        if "x-powered-by" in r.headers:
            issues.append("X-Powered-By header leaks tech stack")
        if "server" in r.headers and r.headers["server"] not in ["", "nginx"]:
            issues.append(f"Server header: {r.headers['server']}")
        if not r.headers.get("x-content-type-options"):
            issues.append("Missing X-Content-Type-Options header")
        status = "FAIL" if issues else "PASS"
        return {
            "rule_id": "API7",
            "rule_name": "Security Misconfiguration",
            "status": status,
            "detail": "; ".join(issues) if issues else "Security headers properly configured",
        }
    except Exception as e:
        return {"rule_id": "API7", "rule_name": "Security Misconfiguration", "status": "WARN", "detail": str(e)}


async def _check_injection(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API8: Injection — test SQL injection and NoSQL injection payloads."""
    payloads = ["' OR '1'='1", "1; DROP TABLE users--", '{"$gt": ""}']
    try:
        for payload in payloads:
            r = await client.get(f"{base_url}{endpoint}?id={payload}", timeout=5)
            if r.status_code == 200 and len(r.text) > 100:
                return {
                    "rule_id": "API8",
                    "rule_name": "Injection",
                    "status": "FAIL",
                    "detail": f"Possible injection vulnerability detected with payload: {payload}",
                }
        return {"rule_id": "API8", "rule_name": "Injection", "status": "PASS", "detail": "No injection vulnerabilities detected"}
    except Exception as e:
        return {"rule_id": "API8", "rule_name": "Injection", "status": "WARN", "detail": str(e)}


async def _check_asset_management(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API9: Improper Assets Management — check for old API versions."""
    old_versions = ["/v0/", "/v1/", "/v2/", "/api/old/", "/api/legacy/"]
    try:
        for version in old_versions:
            test_url = f"{base_url}{version}health"
            r = await client.get(test_url, timeout=3)
            if r.status_code == 200:
                return {
                    "rule_id": "API9",
                    "rule_name": "Improper Assets Management",
                    "status": "FAIL",
                    "detail": f"Old API version accessible at {test_url}",
                }
        return {"rule_id": "API9", "rule_name": "Improper Assets Management", "status": "PASS", "detail": "No deprecated API versions found"}
    except Exception as e:
        return {"rule_id": "API9", "rule_name": "Improper Assets Management", "status": "WARN", "detail": str(e)}


async def _check_logging_monitoring(client: httpx.AsyncClient, base_url: str, endpoint: str) -> Dict:
    """API10: Insufficient Logging & Monitoring — heuristic check."""
    # This is a heuristic — we check if the API exposes any audit/log endpoints
    try:
        r = await client.get(f"{base_url}/logs", timeout=3)
        if r.status_code == 200:
            return {
                "rule_id": "API10",
                "rule_name": "Insufficient Logging & Monitoring",
                "status": "WARN",
                "detail": "Log endpoint /logs is publicly accessible — review access controls",
            }
        return {
            "rule_id": "API10",
            "rule_name": "Insufficient Logging & Monitoring",
            "status": "PASS",
            "detail": "Log endpoints not publicly accessible (manual review recommended)",
        }
    except Exception as e:
        return {"rule_id": "API10", "rule_name": "Insufficient Logging & Monitoring", "status": "WARN", "detail": "Could not reach endpoint for logging check"}


async def run_full_scan(base_url: str, endpoint: str) -> List[Dict]:
    """
    Runs all 10 OWASP rules concurrently via asyncio.gather.
    Returns list of result dicts.
    """
    async with httpx.AsyncClient(verify=False, follow_redirects=True) as client:
        results = await asyncio.gather(
            _check_broken_object_auth(client, base_url, endpoint),
            _check_broken_auth(client, base_url, endpoint),
            _check_excessive_data(client, base_url, endpoint),
            _check_rate_limiting(client, base_url, endpoint),
            _check_function_auth(client, base_url, endpoint),
            _check_mass_assignment(client, base_url, endpoint),
            _check_security_misconfig(client, base_url, endpoint),
            _check_injection(client, base_url, endpoint),
            _check_asset_management(client, base_url, endpoint),
            _check_logging_monitoring(client, base_url, endpoint),
        )
    return list(results)
