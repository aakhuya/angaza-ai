import asyncio

from app.services.event_bus import event_bus
from app.services.insight_store import insight_store
from app.services.match_runner import match_runners


async def _collect_until_finished(match_id: str, timeout: float = 15.0):
    """Subscribe first, then collect until a `finished` status arrives.

    Exits on `finished` (not a fixed count) so we don't race the producer's
    tail emissions.
    """
    collected = []
    agen = event_bus.subscribe(match_id)
    try:
        while True:
            envelope = await asyncio.wait_for(agen.__anext__(), timeout=timeout)
            collected.append(envelope)
            if envelope.type == "status" and envelope.status == "finished":
                break
    except TimeoutError:
        pass
    finally:
        await agen.aclose()
    return collected


async def test_runner_emits_status_events_state_and_insights():
    match_id = "test-runner-1"
    insight_store.clear(match_id)

    consumer = asyncio.create_task(_collect_until_finished(match_id, timeout=15.0))
    # Give the subscriber a chance to attach before the producer starts.
    await asyncio.sleep(0.05)

    started = await match_runners.start(
        match_id=match_id,
        seed=42,
        scenario="balanced",
        viewer_mode="analyst",
        speed_multiplier=5000.0,  # fast: whole match in ~1 wall-sec
    )
    assert started

    envelopes = await asyncio.wait_for(consumer, timeout=20.0)
    await match_runners.stop(match_id)

    kinds = {e.type for e in envelopes}
    assert "status" in kinds
    assert "event" in kinds
    assert "state" in kinds
    assert "insight" in kinds

    statuses = [e.status for e in envelopes if e.type == "status"]
    assert "live" in statuses
    assert "finished" in statuses

    insights = insight_store.list(match_id)
    assert len(insights) > 0
    assert all(i.viewer_mode == "analyst" for i in insights)
