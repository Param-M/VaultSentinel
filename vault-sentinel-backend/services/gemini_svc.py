"""
gemini_svc.py — Plain-English LLM risk summaries via Google Gemini API.
Used in TWO places:
  1. POST /apis/scan  → auto-generates summary for every ZOMBIE/GHOST endpoint found
  2. GET  /apis/{id}/explain → on-demand re-generation for any endpoint

Results are cached in Redis for 1 hour to minimise API calls.
Model: gemini-1.5-flash (gemini-pro was deprecated May 2024)
"""
import redis
import hashlib
import logging
from config import settings

logger = logging.getLogger(__name__)

r = redis.from_url(settings.redis_url, decode_responses=True)
CACHE_TTL = 3600  # 1 hour


def _cache_key(endpoint: str, score: float) -> str:
    raw = f"{endpoint}:{score:.1f}"
    return f"gemini:{hashlib.md5(raw.encode()).hexdigest()}"


def _fallback_summary(endpoint: str, risk_score: float, risk_class: str,
                       cve_count: int, inactive_days: int, auth_type: str) -> str:
    """Rule-based fallback when Gemini API is unavailable or not configured."""
    auth_desc = {
        "none": "no authentication whatsoever",
        "basic": "only basic HTTP authentication (easily bypassed)",
        "bearer": "bearer token authentication",
        "oauth2": "OAuth2 authentication",
    }.get(auth_type.lower(), f"{auth_type} authentication")

    action = {
        "GHOST": "This endpoint must be quarantined immediately — auto-quarantine has been triggered.",
        "ZOMBIE": "Immediate human review and quarantine are required before this endpoint is exploited.",
        "DORMANT": "Schedule a security review and assign an owner team within 7 days.",
        "ACTIVE": "Continue monitoring; no immediate action required.",
    }.get(risk_class, "Review and remediate according to your security policy.")

    cve_text = f" It has {cve_count} known CVEs in its dependency chain." if cve_count > 0 else ""

    return (
        f"This API endpoint ({endpoint}) has been classified as {risk_class} with a risk score of "
        f"{risk_score:.0f}/100 — it has been inactive for {inactive_days} days and uses {auth_desc}.{cve_text} "
        f"An attacker who discovers this endpoint can access it without proper authorisation, "
        f"potentially exfiltrating sensitive customer data or gaining a foothold in your banking infrastructure. "
        f"{action}"
    )


async def explain_risk(
    endpoint: str,
    risk_score: float,
    risk_class: str,
    contributing_factors: list,
    cve_count: int,
    inactive_days: int,
    auth_type: str,
    force_refresh: bool = False,
) -> str:
    """
    Generates a plain-English CISO-ready risk summary for a flagged API endpoint.

    Args:
        endpoint: The API path e.g. /api/v0/user-data
        risk_score: 0–100 composite risk score
        risk_class: ACTIVE | DORMANT | ZOMBIE | GHOST
        contributing_factors: list of scoring reason strings
        cve_count: number of known CVEs
        inactive_days: days since last traffic
        auth_type: none | basic | bearer | oauth2
        force_refresh: bypass cache and regenerate

    Returns:
        Plain-English 3-sentence summary (from Gemini or rule-based fallback)
    """
    cache_key = _cache_key(endpoint, risk_score)

    if not force_refresh:
        cached = r.get(cache_key)
        if cached:
            return cached

    # Check if Gemini API key is configured
    if not settings.gemini_api_key or settings.gemini_api_key in ("", "your-gemini-api-key"):
        logger.warning("[gemini_svc] GEMINI_API_KEY not set — using rule-based fallback summary")
        summary = _fallback_summary(endpoint, risk_score, risk_class, cve_count, inactive_days, auth_type)
        r.setex(cache_key, CACHE_TTL, summary)
        return summary

    factors_text = "\n".join(f"  • {f}" for f in contributing_factors) if contributing_factors else "  • See risk score breakdown"

    prompt = f"""You are a senior cybersecurity analyst at an Indian banking institution (PSB — Public Sector Bank).

A Zombie API has been detected by Vault Sentinel with the following profile:

Endpoint: {endpoint}
Risk Score: {risk_score:.0f}/100
Classification: {risk_class}
Days Inactive: {inactive_days}
Authentication: {auth_type}
Known CVEs: {cve_count}
Contributing Risk Factors:
{factors_text}

Write a concise risk summary for a non-technical CISO. Follow this exact structure:
Sentence 1: What this API endpoint is and why it is dangerous RIGHT NOW (mention the specific risk factors).
Sentence 2: The specific business threat it poses to the bank — what an attacker can actually do with it.
Sentence 3: The single most important immediate action the CISO must authorise.

Rules:
- Maximum 90 words total
- No bullet points, no headers, no markdown
- Plain English — assume the CISO is not technical
- Be specific about Indian banking context (RBI compliance, customer PAN/Aadhaar data, UPI, NACH)
- Sound urgent but professional"""

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)

        # gemini-1.5-flash: fast, free tier, not deprecated (gemini-pro was deprecated May 2024)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.4,       # low temp = consistent, professional tone
                max_output_tokens=150,
            )
        )
        summary = response.text.strip()
        logger.info(f"[gemini_svc] Generated summary for {endpoint} (score {risk_score})")

    except Exception as e:
        logger.error(f"[gemini_svc] Gemini API call failed for {endpoint}: {e}")
        summary = _fallback_summary(endpoint, risk_score, risk_class, cve_count, inactive_days, auth_type)

    r.setex(cache_key, CACHE_TTL, summary)
    return summary
