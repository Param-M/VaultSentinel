from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, unique=True, index=True)  # e.g. "sbi-001"
    bank_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="security_team")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    api_endpoints = relationship("APIEndpoint", back_populates="client")
    alerts = relationship("Alert", back_populates="client")


class APIEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, ForeignKey("clients.client_id"))
    endpoint = Column(String)
    method = Column(String, default="GET")
    service_name = Column(String, nullable=True)
    owner_team = Column(String, nullable=True)

    # Risk scoring
    risk_score = Column(Float, default=0.0)
    risk_class = Column(String, default="ACTIVE")  # ACTIVE, DORMANT, ZOMBIE, GHOST
    is_documented = Column(Boolean, default=True)
    auth_type = Column(String, default="bearer")  # none, basic, bearer, oauth2
    inactive_days = Column(Integer, default=0)
    cve_count = Column(Integer, default=0)
    cvss_max = Column(Float, default=0.0)
    resurrection_detected = Column(Boolean, default=False)

    # OWASP
    owasp_results = Column(JSON, nullable=True)

    # Status
    is_quarantined = Column(Boolean, default=False)
    honeypot_deployed = Column(Boolean, default=False)
    gemini_summary = Column(Text, nullable=True)

    last_seen = Column(DateTime(timezone=True), nullable=True)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    client = relationship("Client", back_populates="api_endpoints")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, ForeignKey("clients.client_id"))
    endpoint = Column(String)
    alert_type = Column(String)  # ZOMBIE_DETECTED, GHOST_QUARANTINED, HONEYPOT_HIT, OWASP_FAIL
    severity = Column(String)    # LOW, MEDIUM, HIGH, CRITICAL
    message = Column(Text)
    details = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="alerts")


class HoneypotHit(Base):
    __tablename__ = "honeypot_hits"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, ForeignKey("clients.client_id"))
    honeypot_endpoint = Column(String)
    attacker_ip = Column(String)
    attacker_method = Column(String)
    attacker_headers = Column(JSON, nullable=True)
    attacker_body = Column(Text, nullable=True)
    captured_at = Column(DateTime(timezone=True), server_default=func.now())


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, ForeignKey("clients.client_id"))
    scan_type = Column(String)  # full, quick, scheduled
    total_apis = Column(Integer, default=0)
    zombie_count = Column(Integer, default=0)
    ghost_count = Column(Integer, default=0)
    avg_risk_score = Column(Float, default=0.0)
    scan_duration_ms = Column(Integer, default=0)
    triggered_by = Column(String, default="manual")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DemoRequest(Base):
    __tablename__ = "demo_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    bank_name = Column(String)
    phone = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, contacted, converted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
