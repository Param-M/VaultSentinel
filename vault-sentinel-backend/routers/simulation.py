from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from auth.dependencies import get_current_user
from models.schemas import SimulationRequest
from services.simulator_svc import run_simulation
from config import settings

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/start")
async def start_simulation(
    request: SimulationRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Starts the attack simulation. Returns SSE stream.
    The target_url should be the victim server (default: http://localhost:8001)
    """
    target = request.target_url or settings.victim_server_url

    return StreamingResponse(
        run_simulation(target, request.attack_type),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
