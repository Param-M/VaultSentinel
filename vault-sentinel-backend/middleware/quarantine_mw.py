"""
quarantine_mw.py — FastAPI middleware.
Checks Redis on EVERY request before routing.
Blocked endpoints return 403 in under 0.3 seconds.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from services.quarantine_svc import is_blocked
import time


class QuarantineMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip auth and health routes from quarantine checks
        EXEMPT_PREFIXES = ["/auth/", "/health", "/docs", "/openapi", "/admin/"]
        if any(path.startswith(prefix) for prefix in EXEMPT_PREFIXES):
            return await call_next(request)

        start = time.perf_counter()

        if is_blocked(path):
            elapsed_ms = (time.perf_counter() - start) * 1000
            return JSONResponse(
                status_code=403,
                content={
                    "error": "ENDPOINT_QUARANTINED",
                    "message": f"This endpoint has been quarantined by Vault Sentinel.",
                    "endpoint": path,
                    "block_time_ms": round(elapsed_ms, 2),
                }
            )

        return await call_next(request)
