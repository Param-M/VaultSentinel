import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from middleware.quarantine_mw import QuarantineMiddleware
from routers import auth, apis, alerts, quarantine, honeypot, simulation, reports, admin, demo, owasp
from services.scheduler import run_scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan — starts the background auto-scan scheduler on startup.
    The scheduler scans all clients every SCAN_INTERVAL_MINUTES (default: 5).
    """
    logger.info("[main] Vault Sentinel backend starting...")
    scheduler_task = asyncio.create_task(run_scheduler())
    logger.info("[main] Auto-scan scheduler started")
    try:
        yield
    finally:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass
        logger.info("[main] Scheduler stopped")


app = FastAPI(
    title="Vault Sentinel API",
    description="Zombie API Discovery, Protection & Removal Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Quarantine middleware — fires before every router
app.add_middleware(QuarantineMiddleware)

# Routers
app.include_router(auth.router)
app.include_router(apis.router)
app.include_router(alerts.router)
app.include_router(quarantine.router)
app.include_router(honeypot.router)
app.include_router(simulation.router)
app.include_router(reports.router)
app.include_router(owasp.router)
app.include_router(admin.router)
app.include_router(demo.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "vault-sentinel-backend",
        "version": "2.0.0",
        "auto_scan": "active",
    }
