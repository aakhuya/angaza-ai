from collections import Counter

from fastapi import APIRouter, Query

from app.services.agent_store import agent_store

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/stats")
def agent_stats(
    match_id: str = Query(..., min_length=1),
    limit: int = Query(2000, ge=1, le=10_000),
) -> dict:
    rows = agent_store.list(match_id, limit=limit)

    total = len(rows)
    if total == 0:
        return {
            "match_id": match_id,
            "total": 0,
            "avg_duration_ms": 0,
            "by_agent": {},
            "by_status": {},
            "providers": {},
            "rejection_rate": 0.0,
        }

    durations = [r.duration_ms for r in rows if r.duration_ms > 0]
    by_agent = Counter(r.agent for r in rows)
    by_status = Counter(r.status for r in rows)
    providers = Counter(r.provider for r in rows if r.provider)

    rejected = by_status.get("rejected", 0)

    return {
        "match_id": match_id,
        "total": total,
        "avg_duration_ms": round(sum(durations) / len(durations), 1) if durations else 0,
        "by_agent": dict(by_agent),
        "by_status": dict(by_status),
        "providers": dict(providers),
        "rejection_rate": round(rejected / total, 3) if total else 0.0,
    }
