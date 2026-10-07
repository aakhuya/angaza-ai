from fastapi import APIRouter, Query

from app.services.agent_store import agent_store

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/executions")
def list_executions(
    match_id: str = Query(..., min_length=1),
    limit: int = Query(200, ge=1, le=1000),
) -> dict:
    rows = agent_store.list(match_id, limit=limit)
    return {
        "match_id": match_id,
        "count": len(rows),
        "executions": [
            {
                "id": r.id,
                "match_id": r.match_id,
                "event_id": r.event_id,
                "agent": r.agent,
                "stage": r.stage,
                "status": r.status,
                "duration_ms": r.duration_ms,
                "provider": r.provider,
                "model": r.model,
                "input_summary": r.input_summary,
                "output_summary": r.output_summary,
                "reasons": list(r.reasons),
                "created_at": r.created_at,
            }
            for r in rows
        ],
    }
