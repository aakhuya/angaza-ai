"""Agent execution records.

Persisted in Postgres so /agents works across Vercel function instances.
The /agents page reads rows, not process memory.
"""
import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


def _uuid() -> str:
    return str(uuid.uuid4())


class AgentExecution(Base, TimestampMixin):
    __tablename__ = "agent_executions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    # Human-readable logical id from the orchestrator (`{match_id}-{event_id}-{agent}-{duration_ms}`).
    # NOT the primary key — the same combination can legitimately repeat over
    # a long-running session if two executions of the same agent happen within
    # the same millisecond. The PK is auto-generated to avoid that collision.
    logical_id: Mapped[str] = mapped_column(String(255), index=True)
    match_id: Mapped[str] = mapped_column(String(120), index=True)
    event_id: Mapped[str] = mapped_column(String(120), index=True)
    agent: Mapped[str] = mapped_column(String(40), index=True)
    stage: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(20), index=True)
    duration_ms: Mapped[int] = mapped_column(Integer)
    provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    model: Mapped[str | None] = mapped_column(String(80), nullable=True)
    input_summary: Mapped[dict] = mapped_column(JSON, default=dict)
    output_summary: Mapped[dict] = mapped_column(JSON, default=dict)
    reasons: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
