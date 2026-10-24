from datetime import datetime, timezone

from fastapi import APIRouter

from app.services import live_tracker

router = APIRouter(prefix="/live", tags=["live"])


@router.get("/status")
def status() -> dict:
    """Return all matches currently reported live.

    Reads from the database, not from process memory — this makes the
    endpoint reliable across Vercel's serverless function instances.
    """
    rows = live_tracker.list_live()
    return {
        "count": len(rows),
        "match_ids": [r["match_id"] for r in rows],
        "matches": rows,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
