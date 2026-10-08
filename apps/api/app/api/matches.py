import json

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app.analytics.compute import compute_state
from app.schemas.stream import Envelope, StatusEnvelope
from app.services.event_bus import event_bus
from app.services.insight_store import insight_store
from app.api.deps import ACCESS_COOKIE
from app.core.security import decode_access_token
from app.models.session import get_db
from app.models.user import Preferences, User
from app.services.match_runner import match_runners
from app.simulation.engine import SimulationEngine
from app.simulation.scenarios import SCENARIOS

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("")
def list_matches() -> dict:
    return {"scenarios": list(SCENARIOS.keys())}


@router.post("/{match_id}/start")
async def start_match(
    match_id: str,
    request: Request,
    seed: int = Query(42),
    scenario: str = Query("balanced"),
    viewer_mode: str | None = Query(None, pattern="^(casual|analyst|player_focus)$"),
    speed: float = Query(60.0, gt=0.0, le=600.0),
    db: Session = Depends(get_db),
) -> dict:
    if scenario not in SCENARIOS:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {scenario}")

    resolved_mode = viewer_mode or _user_viewer_mode(request, db) or "analyst"

    started = await match_runners.start(
        match_id=match_id,
        seed=seed,
        scenario=scenario,
        viewer_mode=resolved_mode,
        speed_multiplier=speed,
    )
    if not started:
        raise HTTPException(status_code=409, detail="Match already running")
    return {"status": "started", "match_id": match_id, "viewer_mode": resolved_mode}


def _user_viewer_mode(request: Request, db: Session) -> str | None:
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        return None
    user_id = decode_access_token(token)
    if not user_id:
        return None
    prefs = db.scalar(select(Preferences).where(Preferences.user_id == user_id))
    if prefs is None:
        # Ensure a default row exists for authenticated users going forward.
        if db.get(User, user_id) is None:
            return None
    return prefs.viewer_mode if prefs else None


@router.post("/{match_id}/stop")
async def stop_match(match_id: str) -> dict:
    stopped = await match_runners.stop(match_id)
    if not stopped:
        raise HTTPException(status_code=404, detail="Match not running")
    await event_bus.publish(match_id, StatusEnvelope(status="paused"))
    return {"status": "stopped", "match_id": match_id}


@router.get("/{match_id}/statistics")
def get_statistics(
    match_id: str,
    seed: int = Query(42),
    scenario: str = Query("balanced"),
) -> dict:
    if scenario not in SCENARIOS:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {scenario}")
    events = SimulationEngine(match_id, seed=seed, scenario=scenario).generate()
    state = compute_state(match_id, events)
    return state.model_dump()


@router.get("/{match_id}/insights")
def get_insights(
    match_id: str,
    viewer_mode: str | None = Query(None),
    since_minute: int | None = Query(None, ge=0, le=120),
) -> dict:
    items = insight_store.list(match_id, viewer_mode=viewer_mode, since_minute=since_minute)
    return {"match_id": match_id, "count": len(items), "insights": [i.model_dump() for i in items]}


@router.get("/{match_id}/stream")
async def stream_match(match_id: str) -> EventSourceResponse:
    async def gen():
        async for envelope in event_bus.subscribe(match_id):
            yield _serialize(envelope)

    return EventSourceResponse(gen())


def _serialize(envelope: Envelope) -> dict:
    return {"event": envelope.type, "data": json.dumps(envelope.model_dump(mode="json"))}
