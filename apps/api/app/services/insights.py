import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime


@dataclass
class InsightRecord:
    id: str
    match_id: str
    minute: int
    second: int
    category: str
    title: str
    body: str
    why_it_matters: str
    supporting_event_ids: list[str]
    statistics: dict[str, object]
    confidence: float
    viewer_mode: str
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def to_message(self) -> dict:
        return {
            "id": self.id,
            "match_id": self.match_id,
            "minute": self.minute,
            "second": self.second,
            "category": self.category,
            "title": self.title,
            "body": self.body,
            "why_it_matters": self.why_it_matters,
            "supporting_event_ids": self.supporting_event_ids,
            "statistics": self.statistics,
            "confidence": self.confidence,
            "viewer_mode": self.viewer_mode,
            "created_at": self.created_at.isoformat(),
        }


class InsightStore:
    """In-memory per-match insight history. Phase 7 moves this to Postgres."""

    def __init__(self) -> None:
        self._by_match: dict[str, list[InsightRecord]] = {}

    def add(self, rec: InsightRecord) -> InsightRecord:
        self._by_match.setdefault(rec.match_id, []).append(rec)
        return rec

    def list(self, match_id: str, viewer_mode: str | None = None) -> list[InsightRecord]:
        rows = self._by_match.get(match_id, [])
        if viewer_mode is None:
            return list(rows)
        return [r for r in rows if r.viewer_mode == viewer_mode]

    @staticmethod
    def new_id() -> str:
        return str(uuid.uuid4())


insight_store = InsightStore()
