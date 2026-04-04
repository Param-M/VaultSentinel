"""
scorer.py — 7-rule composite risk scoring engine.
Produces a 0–100 Zombie Risk Score and classifies each API.
"""
from typing import Dict, Any, Tuple, List


RISK_CLASSES = [
    (0, 30, "ACTIVE"),
    (31, 60, "DORMANT"),
    (61, 85, "ZOMBIE"),
    (86, 100, "GHOST"),
]


def classify(score: float) -> str:
    for low, high, label in RISK_CLASSES:
        if low <= score <= high:
            return label
    return "GHOST"


def calculate_score(
    inactive_days: int,
    auth_type: str,          # none, basic, bearer, oauth2
    cve_count: int,
    cvss_max: float,
    is_documented: bool,
    has_owner: bool,
    error_rate: float,       # 0.0 – 1.0
    resurrection_detected: bool = False,
) -> Tuple[float, List[str]]:
    """
    Returns (composite_score, list_of_contributing_reasons).
    Maximum base score = 75. Resurrection detection adds +25.
    """
    reasons = []
    score = 0.0

    # Rule 1 — Inactivity (max 25 pts)
    if inactive_days > 365:
        pts = 25
    elif inactive_days > 180:
        pts = 20
    elif inactive_days > 90:
        pts = 15
    elif inactive_days > 30:
        pts = 8
    else:
        pts = 0
    if pts:
        reasons.append(f"Inactive for {inactive_days} days (+{pts})")
    score += pts

    # Rule 2 — Auth weakness (max 20 pts)
    auth_scores = {"none": 20, "basic": 12, "bearer": 4, "oauth2": 0}
    auth_pts = auth_scores.get(auth_type.lower(), 8)
    if auth_pts:
        reasons.append(f"Weak auth ({auth_type}) (+{auth_pts})")
    score += auth_pts

    # Rule 3 — CVE count (max 15 pts)
    if cve_count >= 5:
        cve_pts = 15
    elif cve_count >= 3:
        cve_pts = 10
    elif cve_count >= 1:
        cve_pts = 5
    else:
        cve_pts = 0
    if cve_pts:
        reasons.append(f"{cve_count} CVEs detected (+{cve_pts})")
    score += cve_pts

    # Rule 4 — CVSS severity boost (max 10 pts)
    if cvss_max >= 9.0:
        cvss_pts = 10
    elif cvss_max >= 7.0:
        cvss_pts = 7
    elif cvss_max >= 4.0:
        cvss_pts = 3
    else:
        cvss_pts = 0
    if cvss_pts:
        reasons.append(f"CVSS {cvss_max:.1f} critical vulnerability (+{cvss_pts})")
    score += cvss_pts

    # Rule 5 — Undocumented (10 pts flat)
    if not is_documented:
        reasons.append("Endpoint not in OpenAPI spec (+10)")
        score += 10

    # Rule 6 — No owner (8 pts flat)
    if not has_owner:
        reasons.append("No assigned owner team (+8)")
        score += 8

    # Rule 7 — High error rate (max 7 pts)
    if error_rate >= 0.5:
        err_pts = 7
    elif error_rate >= 0.3:
        err_pts = 4
    elif error_rate >= 0.1:
        err_pts = 2
    else:
        err_pts = 0
    if err_pts:
        reasons.append(f"{error_rate*100:.0f}% error rate (+{err_pts})")
    score += err_pts

    # Resurrection bonus (+25 if anomaly detected on dormant endpoint)
    if resurrection_detected:
        reasons.append("Traffic resurrection on dormant endpoint (+25)")
        score += 25

    final_score = min(100.0, round(score, 1))
    return final_score, reasons


def get_reasons(score: float, reasons: List[str]) -> Dict[str, Any]:
    """Returns a formatted dict for API response."""
    return {
        "score": score,
        "class": classify(score),
        "contributing_factors": reasons,
        "automated_action": _get_action(score),
    }


def _get_action(score: float) -> str:
    if score <= 30:
        return "Monitor only · weekly scan"
    elif score <= 60:
        return "Email alert to security team"
    elif score <= 85:
        return "Slack alert + mandatory human review"
    else:
        return "Instant auto-quarantine + incident report"
