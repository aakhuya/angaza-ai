"""Agent execution store.

Reads and writes `agent_executions` rows in Postgres. On SQLite (tests,
local dev) it uses the same SQLAlchemy path — no branching.

The public API is unchanged from the previous in-memory version:

    store.add(execution)
    store.list(match_id, limit=N)
    store.clear(match_id)

That means callers (orchestrator, /agents route, tests) do not need to change.
"""
from dataclasses import dataclass, field
from datetime import UTC, datetime
from threading import Lock
from typing import Any


@dataclass(frozen=True)
class AgentExecution:
    """Value object exposed to callers.

    The DB model has more fields (a logical_id separate from the PK, a
    nullable created_at default, etc.). This dataclass mirrors the previous
    shape so nothing downstream breaks.
    """

    id: str
    match_id: str
    event_id: str
    agent: str
    stage: str
    status: str
    duration_ms: int
    provider: str | None
    model: str | None
    input_summary: dict[str, Any] = field(default_factory=dict)
    output_summary: dict[str, Any] = field(default_factory=dict)
    reasons: tuple[str, ...] = ()
    created_at: str = ""


class AgentExecutionStore:
    """DB-backed store with the same interface as the old in-memory version."""

    def __init__(self, max_per_match: int = 500) -> None:
        # Kept for compatibility with existing __init__ calls (tests instantiate
        # with max_per_match). Not enforced on the DB side — a bounded query
        # limit is applied on read instead.
        self._max = max_per_match
        self._lock = Lock()  # only for the write path, to keep the SQL transaction tidy

    def add(self, execution: AgentExecution) -> None:
        # Late-bind so pytest fixtures can replace the engine, same pattern as
        # live_tracker.
        from app.models.agent_execution import AgentExecution as Row
        from app.models.session import SessionLocal

        created_at = execution.created_at or datetime.now(UTC).isoformat()

        db = SessionLocal()
        try:
            db.add(
                Row(
                    id=execution.id if execution.id else None,
                    logical_id=execution.id,
                    match_id=execution.match_id,
                    event_id=execution.event_id,
                    agent=execution.agent,
                    stage=execution.stage,
                    status=execution.status,
                    duration_ms=execution.duration_ms,
                    provider=execution.provider,
                    model=execution.model,
                    input_summary=dict(execution.input_summary or {}),
                    output_summary=dict(execution.output_summary or {}),
                    reasons=list(execution.reasons or ()),
                    created_at=datetime.fromisoformat(created_at.replace("Z", "+00:00")),
                )
            )
            db.commit()
        except Exception:
            # Never let logging break the pipeline. If the DB is down, the
            # caller continues; the /agents page shows fewer rows than the
            # pipeline produced. That's the correct failure mode.
            db.rollback()
        finally:
            db.close()

    def list(self, match_id: str, limit: int = 200) -> list[AgentExecution]:
        from sqlalchemy import select

        from app.models.agent_execution import AgentExecution as Row
        from app.models.session import SessionLocal

        db = SessionLocal()
        try:
            rows = db.scalars(
                select(Row)
                .where(Row.match_id == match_id)
                .order_by(Row.created_at.asc())
                .limit(limit)
            ).all()
            return [
                AgentExecution(
                    id=r.logical_id,
                    match_id=r.match_id,
                    event_id=r.event_id,
                    agent=r.agent,
                    stage=r.stage,
                    status=r.status,
                    duration_ms=r.duration_ms,
                    provider=r.provider,
                    model=r.model,
                    input_summary=dict(r.input_summary or {}),
                    output_summary=dict(r.output_summary or {}),
                    reasons=tuple(r.reasons or ()),
                    created_at=r.created_at.isoformat() if r.created_at else "",
                )
                for r in rows
            ]
        except Exception:
            # Same fail-safe: if the DB is misconfigured, /agents shows an
            # empty state instead of 500ing.
            return []
        finally:
            db.close()

    def clear(self, match_id: str) -> None:
        from sqlalchemy import delete

        from app.models.agent_execution import AgentExecution as Row
        from app.models.session import SessionLocal

        db = SessionLocal()
        try:
            db.execute(delete(Row).where(Row.match_id == match_id))
            db.commit()
        finally:
            db.close()


# Same singleton instance used by the orchestrator and /agents route.
agent_store = AgentExecutionStore()
