from datetime import datetime, timezone

from app.analytics.compute import compute_state, score_importance
from app.schemas.events import PassEvent, ShotEvent
from app.services.insight_generator import generate

T0 = datetime(2025, 1, 1, tzinfo=timezone.utc)


def _goal_state_and_event():
    ev = ShotEvent(
        event_id="s1", match_id="m1", timestamp=T0, minute=70, second=0,
        team_id="HOME", player_id="HOME-p09", x=0.85, y=0.5,
        event_type="goal", distance_m=12, speed_kmh=95, on_target=True,
    )
    state = compute_state("m1", [ev])
    imp = score_importance(ev, state)
    return ev, state, imp


def test_goal_produces_key_moment_category():
    ev, state, imp = _goal_state_and_event()
    insight = generate(ev, state, imp, viewer_mode="analyst")
    assert insight.category == "key_moment"
    assert "score" in insight.title.lower()
    assert insight.viewer_mode == "analyst"
    assert insight.supporting_event_ids == [ev.event_id]


def test_casual_and_analyst_bodies_differ():
    ev, state, imp = _goal_state_and_event()
    casual = generate(ev, state, imp, viewer_mode="casual")
    analyst = generate(ev, state, imp, viewer_mode="analyst")
    assert casual.body != analyst.body
    assert "momentum" in casual.body.lower()


def test_progressive_pass_category():
    ev = PassEvent(
        event_id="p1", match_id="m1", timestamp=T0,
        minute=20, second=0, team_id="HOME", player_id="HOME-p06",
        x=0.4, y=0.5, event_type="pass", distance_m=30.0, completed=True,
        difficulty=0.6, end_x=0.7, end_y=0.5,
    )
    state = compute_state("m1", [ev])
    imp = score_importance(ev, state)
    insight = generate(ev, state, imp)
    assert insight.category == "progression"
