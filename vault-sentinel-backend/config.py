from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:password@localhost:5432/vaultsentinel"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # JWT
    jwt_secret_key: str = "change-this-secret"
    link_token_secret: str = "change-this-link-secret"
    jwt_algorithm: str = "HS256"
    session_expire_hours: int = 24

    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    from_email: str = "noreply@vaultsentinel.com"

    # External APIs
    gemini_api_key: str = ""
    nvd_api_key: str = ""

    # App URLs
    app_base_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # Thresholds
    quarantine_threshold: int = 85
    scan_interval_minutes: int = 5

    # Victim server
    victim_server_url: str = "http://localhost:8001"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
