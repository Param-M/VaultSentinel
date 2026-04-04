from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime


# ─── Auth ───────────────────────────────────────────────────────────────────

class LinkTokenPayload(BaseModel):
    client_id: str
    bank_name: str
    email: str
    purpose: str = "dashboard_access"
    iat: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    link_token: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    client_id: str
    bank_name: str
    email: str
    role: str


class VerifyLinkTokenResponse(BaseModel):
    valid: bool
    email: Optional[str] = None
    bank_name: Optional[str] = None
    client_id: Optional[str] = None
    message: Optional[str] = None


class UserOut(BaseModel):
    client_id: str
    bank_name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ─── API Endpoints ──────────────────────────────────────────────────────────

class APIEndpointOut(BaseModel):
    id: int
    endpoint: str
    method: str
    service_name: Optional[str]
    owner_team: Optional[str]
    risk_score: float
    risk_class: str
    is_documented: bool
    auth_type: str
    inactive_days: int
    cve_count: int
    cvss_max: float
    resurrection_detected: bool
    owasp_results: Optional[Dict[str, Any]]
    is_quarantined: bool
    honeypot_deployed: bool
    gemini_summary: Optional[str]
    last_seen: Optional[datetime]
    first_seen: datetime

    class Config:
        from_attributes = True


class ScanRequest(BaseModel):
    scan_type: str = "full"  # full, quick


class PatchEndpointRequest(BaseModel):
    owner_team: Optional[str] = None
    service_name: Optional[str] = None


# ─── Alerts ─────────────────────────────────────────────────────────────────

class AlertOut(BaseModel):
    id: int
    endpoint: str
    alert_type: str
    severity: str
    message: str
    details: Optional[Dict[str, Any]]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Quarantine ─────────────────────────────────────────────────────────────

class QuarantineRequest(BaseModel):
    endpoint: str
    reason: Optional[str] = "Manual quarantine"


class QuarantineStatus(BaseModel):
    endpoint: str
    is_blocked: bool
    reason: Optional[str]
    blocked_at: Optional[str]


# ─── Honeypot ───────────────────────────────────────────────────────────────

class HoneypotDeployRequest(BaseModel):
    target_endpoint: str  # the zombie API to replace


class HoneypotHitOut(BaseModel):
    id: int
    honeypot_endpoint: str
    attacker_ip: str
    attacker_method: str
    captured_at: datetime

    class Config:
        from_attributes = True


# ─── OWASP ──────────────────────────────────────────────────────────────────

class OWASPScanRequest(BaseModel):
    endpoint_id: int


class OWASPResult(BaseModel):
    rule_id: str
    rule_name: str
    status: str  # PASS, FAIL, WARN
    detail: str


class OWASPScanResponse(BaseModel):
    endpoint: str
    results: List[OWASPResult]
    pass_count: int
    fail_count: int
    warn_count: int


# ─── Simulation ─────────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    target_url: str
    attack_type: str = "full"  # full, reconnaissance, injection, data_exfil


# ─── Reports ────────────────────────────────────────────────────────────────

class ReportRequest(BaseModel):
    report_type: str  # rbi, pci


# ─── Admin ──────────────────────────────────────────────────────────────────

class CreateClientRequest(BaseModel):
    bank_name: str
    email: EmailStr
    password: str
    client_id: Optional[str] = None


class CreateClientResponse(BaseModel):
    client_id: str
    bank_name: str
    email: str
    link_sent: bool
    credentials_sent: bool


# ─── Demo ───────────────────────────────────────────────────────────────────

class DemoBookRequest(BaseModel):
    name: str
    email: EmailStr
    bank_name: str
    phone: Optional[str] = None
    message: Optional[str] = None


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_apis: int
    active_count: int
    dormant_count: int
    zombie_count: int
    ghost_count: int
    quarantined_count: int
    honeypot_hits_today: int
    avg_risk_score: float
    compliance_score: float
    last_scan: Optional[datetime]
