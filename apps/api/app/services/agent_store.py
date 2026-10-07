from collections import defaultdict
from dataclasses import dataclass, field
from datetime import UTC, datetime
from threading import Lock
from typing import Any


@dataclass(frozen=True)
class AgentExecution:
    id: str
    match_id: str
    event_id: str
    agent: str
    stage: str
    status: str  # "ok" | "rejected" | "error"
    duration_ms: int
    provider: str | None
    model: str | None
    input_summary: dict[str, Any] = field(default_factory=dict)
    output_summary: dict[str, Any] = field(default_factory=dict)
    reasons: tuple[str, ...] = ()
    created_at: str = ""


class AgentExecutionStore:
    """Bounded per-match ring of real agent executions for the /agents page."""

    def __init__(self, max_per_match: int = 500) -> None:
        self._lock = Lock()
        self._by_match: dict[str, list[AgentExecution]] = defaultdict(list)
        self._max = max_per_match

    def add(self, execution: AgentExecution) -> None:
        row = execution if execution.created_at else AgentExecution(
            **{**execution.__dict__, "created_at": datetime.now(UTC).isoformat()}
        )
        with self._lock:
            bucket = self._by_match[row.match_id]
            bucket.append(row)
            if len(bucket) > self._max:
                del bucket[: len(bucket) - self._max]

    def list(self, match_id: str, limit: int = 200) -> list[AgentExecution]:
        with self._lock:
            return list(self._by_match.get(match_id, []))[-limit:]

    def clear(self, match_id: str) -> None:
        with self._lock:
            self._by_match.pop(match_id, None)


agent_store = AgentExecutionStore()
