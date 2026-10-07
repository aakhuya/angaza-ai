import asyncio
import inspect
from datetime import datetime, timezone

from app.ai.mock import MockProvider
from app.ai.registry import set_provider_override
from app.analytics.compute import compute_state, score_importance
from app.schemas.events import PassEvent
from app.services.insight_generator import generate

T0 = datetime(2025, 1, 1, tzinfo=timezone.utc)


def _fixture():
    ev = PassEvent(
        event_id="p1", match_id="m1-gen", timestamp=T0, minute=20, second=0,
        team_id="HOME", player_id="HOME-p06", x=0.4, y=0.5,
        event_type="pass", distance_m=30.0, completed=True, difficulty=0.6,
        end_x=0.7, end_y=0.5,
    )
    state = compute_state("m1-gen", [ev])
    imp = score_importance(ev, state)
    return ev, state, imp


def test_generate_returns_none_or_insight_under_mock():
    """With the mock provider, verification may reject; both outcomes are valid.

    What we assert is the *contract*: the pipeline runs and either produces a
    well-shaped InsightEnvelope or declines cleanly (None).
    """
    set_provider_override(MockProvider())
    try:
        ev, state, imp = _fixture()
        result = asyncio.run(generate(ev, state, imp, viewer_mode="analyst"))
        if result is not None:
            assert result.match_id == "m1-gen"
            assert result.viewer_mode == "analyst"
            assert result.supporting_event_ids == [ev.event_id]
            assert result.category in {
                "key_moment", "chance", "progression", "defensive",
                "pressure", "milestone", "context",
            }
            assert result.title
            assert result.body
            assert 0.0 <= result.confidence <= 1.0
    finally:
        set_provider_override(None)


def test_generate_is_async():
    """Guard against regressions where generate becomes sync again."""
    assert inspect.iscoroutinefunction(generate)
