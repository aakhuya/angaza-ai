import asyncio
from datetime import UTC, datetime

from app.agents.facts import build_fact_bundle
from app.agents.orchestrator import run
from app.ai.mock import MockProvider
from app.analytics.compute import compute_state, score_importance
from app.schemas.events import PassEvent
from app.services.agent_store import agent_store

T0 = datetime(2025, 1, 1, tzinfo=UTC)


def _bundle():
    ev = PassEvent(
        event_id="p1", match_id="m1-orch", timestamp=T0, minute=20, second=0,
        team_id="HOME", player_id="HOME-p06", x=0.4, y=0.5,
        event_type="pass", distance_m=30.0, completed=True, difficulty=0.6,
        end_x=0.7, end_y=0.5,
    )
    state = compute_state("m1-orch", [ev])
    imp = score_importance(ev, state)
    return build_fact_bundle(ev, state, imp)


def test_orchestrator_runs_all_agents_and_records():
    agent_store.clear("m1-orch")
    bundle = _bundle()
    outcome = asyncio.run(run(provider=MockProvider(), bundle=bundle, viewer_mode="analyst"))
    records = agent_store.list("m1-orch")
    agents = {r.agent for r in records}
    assert "match_intelligence" in agents
    if outcome is not None:
        assert outcome.category in {
            "key_moment", "chance", "progression", "defensive",
            "pressure", "milestone", "context",
        }
        assert "narrative" in agents
        assert "personalization" in agents
