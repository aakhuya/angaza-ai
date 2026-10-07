import asyncio
from dataclasses import dataclass

from app.analytics.compute import compute_state, score_importance
from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.stream import (
    EventEnvelope,
    ImportanceEnvelope,
    InsightEnvelope,
    StateEnvelope,
    StatusEnvelope,
)
from app.services.event_bus import event_bus
from app.services.insight_generator import generate as generate_insight_stub
from app.services.insight_store import insight_store
from app.simulation.engine import SimulationEngine

log = get_logger("angaza.runner")

IMPORTANCE_THRESHOLD = 0.30


@dataclass
class RunnerHandle:
    match_id: str
    task: asyncio.Task
    stop: asyncio.Event


class MatchRunnerRegistry:
    def __init__(self) -> None:
        self._runners: dict[str, RunnerHandle] = {}
        self._lock = asyncio.Lock()

    async def is_running(self, match_id: str) -> bool:
        async with self._lock:
            handle = self._runners.get(match_id)
            return handle is not None and not handle.task.done()

    async def start(
        self,
        match_id: str,
        seed: int,
        scenario: str,
        viewer_mode: str = "analyst",
        speed_multiplier: float | None = None,
    ) -> bool:
        async with self._lock:
            if match_id in self._runners and not self._runners[match_id].task.done():
                return False
            stop = asyncio.Event()
            task = asyncio.create_task(
                _run_match(match_id, seed, scenario, viewer_mode, speed_multiplier, stop)
            )
            self._runners[match_id] = RunnerHandle(match_id=match_id, task=task, stop=stop)
            return True

    async def stop(self, match_id: str) -> bool:
        async with self._lock:
            handle = self._runners.get(match_id)
        if handle is None:
            return False
        handle.stop.set()
        try:
            await asyncio.wait_for(handle.task, timeout=5.0)
        except asyncio.TimeoutError:
            handle.task.cancel()
        return True


match_runners = MatchRunnerRegistry()


async def _run_match(
    match_id: str,
    seed: int,
    scenario: str,
    viewer_mode: str,
    speed_multiplier: float | None,
    stop: asyncio.Event,
) -> None:
    settings = get_settings()
    mult = speed_multiplier if speed_multiplier is not None else 60.0
    # 1 wall-clock second = `mult` match seconds.
    tick_seconds = 1.0 / max(mult, 0.001)

    log.info("runner_started", match_id=match_id, seed=seed, scenario=scenario, speed=mult)

    engine = SimulationEngine(match_id, seed=seed, scenario=scenario)
    all_events = engine.generate()

    insight_store.clear(match_id)
    await event_bus.publish(match_id, StatusEnvelope(status="live"))

    running_events: list = []
    sim_clock = 0.0

    try:
        for ev in all_events:
            if stop.is_set():
                break

            # Wait until sim_clock reaches this event's timestamp.
            target = ev.minute * 60 + ev.second
            while sim_clock < target:
                if stop.is_set():
                    break
                await asyncio.sleep(tick_seconds)
                sim_clock += 1.0

            if stop.is_set():
                break

            running_events.append(ev)
            await event_bus.publish(match_id, EventEnvelope(event=ev))

            state = compute_state(match_id, running_events)
            await event_bus.publish(match_id, StateEnvelope(state=state))

            importance = score_importance(ev, state)
            if importance.score >= IMPORTANCE_THRESHOLD:
                await event_bus.publish(match_id, ImportanceEnvelope(importance=importance))
                insight: InsightEnvelope = generate_insight_stub(
                    ev, state, importance, viewer_mode=viewer_mode
                )
                insight_store.add(insight)
                await event_bus.publish(match_id, insight)

        # Final state snapshot after the last event.
        final_state = compute_state(match_id, running_events)
        await event_bus.publish(match_id, StateEnvelope(state=final_state))
        await event_bus.publish(match_id, StatusEnvelope(status="finished"))
        log.info("runner_finished", match_id=match_id, events=len(running_events))
    except asyncio.CancelledError:
        await event_bus.publish(match_id, StatusEnvelope(status="paused"))
        raise
    finally:
        pass
