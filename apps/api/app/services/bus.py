import asyncio
import contextlib
from collections.abc import AsyncIterator


class MatchBus:
    """Fan-out queue for a single match.

    Each subscriber gets its own queue; publish is non-blocking and drops
    for slow consumers to avoid stalling the runner.
    """

    def __init__(self, max_queue: int = 256) -> None:
        self._subscribers: set[asyncio.Queue] = set()
        self._max_queue = max_queue

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=self._max_queue)
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subscribers.discard(q)

    def publish(self, message: dict) -> None:
        for q in list(self._subscribers):
            # Consumer is too slow; drop to keep the runner real-time.
            with contextlib.suppress(asyncio.QueueFull):
                q.put_nowait(message)

    async def stream(self, q: asyncio.Queue) -> AsyncIterator[dict]:
        try:
            while True:
                yield await q.get()
        finally:
            self.unsubscribe(q)
