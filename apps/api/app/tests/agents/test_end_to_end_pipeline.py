import asyncio

from app.ai.mock import MockProvider
from app.ai.registry import set_provider_override
from app.analytics.compute import compute_state, score_importance
from app.services.agent_store import agent_store
from app.services.insight_generator import generate
from app.simulation.engine import SimulationEngine


def test_full_match_pipeline_with_mock_provider():
    set_provider_override(MockProvider())
    try:
        match_id = "pipeline-m1"
        agent_store.clear(match_id)
        events = SimulationEngine(match_id, seed=3, scenario="balanced").generate()
        running = []
        for ev in events[:400]:
            running.append(ev)
            state = compute_state(match_id, running)
            imp = score_importance(ev, state)
            if imp.score >= 0.30:
                asyncio.run(generate(ev, state, imp, viewer_mode="analyst"))

        records = agent_store.list(match_id)
        assert records, "agent executions should have been recorded"
        statuses = {r.status for r in records}
        assert statuses <= {"ok", "rejected", "error"}
    finally:
        set_provider_override(None)
