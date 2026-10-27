"""Integration test for the match runner + event bus pipeline.

Non-flaky version. Two things make it non-flaky:

1. Subscriber attach uses an `asyncio.Event`, not a fixed sleep.
2. The consumer exits on the `finished` status envelope — not on a timeout.
   The runner definitely publishes `finished`; waiting for anything else is
   a race against the event loop scheduler.
"""
import asyncio

from app.services.event_bus import event_bus
from app.services.insight_store import insight_store
from app.services.match_runner import match_runners


async def _collect_until_finished(
    match_id: str,
    *,
    ready: asyncio.Event,
    per_event_timeout: float = 15.0,
    total_timeout: float = 60.0,
):
    """Subscribe, signal ready, collect until `finished` or total timeout.

    Exits on the `finished` status envelope (the runner always publishes it).
    Total timeout is a belt-and-braces guard against a hung runner — it is
    not the primary exit condition.
    """
    collected = []
    agen = event_bus.subscribe(match_id)
    deadline = asyncio.get_running_loop().time() + total_timeout
    try:
        ready.set()
        while True:
            remaining = deadline - asyncio.get_running_loop().time()
            if remaining <= 0:
                break
            try:
                envelope = await asyncio.wait_for(
                    agen.__anext__(),
                    timeout=min(per_event_timeout, remaining),
                )
            except TimeoutError:
                # No new event arrived in time. If we already have `finished`,
                # that's fine — we break below. Otherwise this is a real
                # hang and we stop.
                break
            collected.append(envelope)
            if envelope.type == "status" and envelope.status == "finished":
                break
    finally:
        await agen.aclose()
    return collected


async def test_runner_emits_status_events_state_and_insights():
    match_id = "test-runner-1"
    insight_store.clear(match_id)

    ready = asyncio.Event()
    consumer = asyncio.create_task(
        _collect_until_finished(match_id, ready=ready)
    )

    # Confirm subscriber is attached before starting the runner.
    await asyncio.wait_for(ready.wait(), timeout=5.0)

    started = await match_runners.start(
        match_id=match_id,
        seed=42,
        scenario="balanced",
        viewer_mode="analyst",
        speed_multiplier=5000.0,
    )
    assert started

    # The consumer exits on the `finished` envelope. Give it 60s to see it;
    # if it does not, we have a real bug and the test should fail.
    try:
        envelopes = await asyncio.wait_for(consumer, timeout=60.0)
    finally:
        await match_runners.stop(match_id)

    # Sanity: the runner actually delivered events.
    kinds = {e.type for e in envelopes}
    assert "status" in kinds
    assert "event" in kinds
    assert "state" in kinds

    statuses = [e.status for e in envelopes if e.type == "status"]
    assert "live" in statuses
    assert "finished" in statuses

    # `insight_store` is the source of truth for what was produced.
    insights = insight_store.list(match_id)
    assert len(insights) > 0
    assert all(i.viewer_mode == "analyst" for i in insights)
