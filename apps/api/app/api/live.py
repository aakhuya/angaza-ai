from datetime import UTC, datetime

from fastapi import APIRouter

from app.services.match_runner import match_runners

router = APIRouter(prefix="/live", tags=["live"])


@router.get("/status")
async def status() -> dict:
    """Return the set of match IDs currently streaming.

    Reads the in-process runner registry. If the API restarts, the set is
    empty — that's correct, because a restarted process has no running
    matches.
    """
    async with match_runners._lock:  # type: ignore[attr-defined]
        running = [
            match_id
            for match_id, handle in match_runners._runners.items()  # type: ignore[attr-defined]
            if not handle.task.done()
        ]
    return {
        "count": len(running),
        "match_ids": running,
        "checked_at": datetime.now(UTC).isoformat(),
    }
