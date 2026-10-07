from collections import defaultdict
from threading import Lock

from app.schemas.stream import InsightEnvelope


class InsightStore:
    """Per-match, in-memory ring of insights.

    Sized for a hackathon: keeps the last N insights per match per viewer mode.
    Swap for a DB table when persistence matters.
    """

    def __init__(self, max_per_match: int = 500) -> None:
        self._lock = Lock()
        self._by_match: dict[str, list[InsightEnvelope]] = defaultdict(list)
        self._max = max_per_match

    def add(self, insight: InsightEnvelope) -> None:
        with self._lock:
            bucket = self._by_match[insight.match_id]
            bucket.append(insight)
            if len(bucket) > self._max:
                del bucket[: len(bucket) - self._max]

    def list(
        self,
        match_id: str,
        viewer_mode: str | None = None,
        since_minute: int | None = None,
    ) -> list[InsightEnvelope]:
        with self._lock:
            items = list(self._by_match.get(match_id, []))
        if viewer_mode:
            items = [i for i in items if i.viewer_mode == viewer_mode]
        if since_minute is not None:
            items = [i for i in items if i.minute >= since_minute]
        return items

    def clear(self, match_id: str) -> None:
        with self._lock:
            self._by_match.pop(match_id, None)


insight_store = InsightStore()
