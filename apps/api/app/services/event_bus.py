import asyncio
from collections import defaultdict
from collections.abc import AsyncIterator

from app.schemas.stream import Envelope


class EventBus:
    """Fan-out bus: one producer per match, many SSE consumers.

    Each subscriber gets its own bounded queue. Slow consumers are dropped
    rather than back-pressuring the producer, which is the right behaviour
    for a live match stream.
    """

    def __init__(self, queue_size: int = 256) -> None:
        self._subs: dict[str, set[asyncio.Queue[Envelope]]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._queue_size = queue_size

    async def publish(self, match_id: str, envelope: Envelope) -> None:
        async with self._lock:
            queues = list(self._subs.get(match_id, ()))
        for q in queues:
            try:
                q.put_nowait(envelope)
            except asyncio.QueueFull:
                # Drop the slow subscriber's oldest item and try again once.
                try:
                    _ = q.get_nowait()
                    q.put_nowait(envelope)
                except Exception:
                    pass

    async def subscribe(self, match_id: str) -> AsyncIterator[Envelope]:
        q: asyncio.Queue[Envelope] = asyncio.Queue(maxsize=self._queue_size)
        async with self._lock:
            self._subs[match_id].add(q)
        try:
            while True:
                yield await q.get()
        finally:
            async with self._lock:
                self._subs[match_id].discard(q)


event_bus = EventBus()
