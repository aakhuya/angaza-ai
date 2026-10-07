from datetime import UTC, datetime

from app.agents.facts import build_fact_bundle
from app.agents.verification import verify
from app.analytics.compute import compute_state, score_importance
from app.schemas.events import PassEvent

T0 = datetime(2025, 1, 1, tzinfo=UTC)
CATEGORIES = {"key_moment", "progression", "context"}


def _bundle():
    ev = PassEvent(
        event_id="p1", match_id="m1", timestamp=T0, minute=20, second=0,
        team_id="HOME", player_id="HOME-p06", x=0.4, y=0.5,
        event_type="pass", distance_m=30.0, completed=True, difficulty=0.6,
        end_x=0.7, end_y=0.5,
    )
    state = compute_state("m1", [ev])
    imp = score_importance(ev, state)
    return ev, state, imp, build_fact_bundle(ev, state, imp)


def test_unknown_player_id_rejected():
    _, _, _, bundle = _bundle()
    result = verify(
        title="t", body="HOME-p99 made a run.",
        supporting_facts=[], category="progression",
        bundle=bundle, allowed_categories=CATEGORIES,
    )
    assert not result.ok
    assert any("unknown player id" in r for r in result.reasons)


def test_known_player_id_accepted():
    _, _, _, bundle = _bundle()
    result = verify(
        title="t", body="HOME-p06 completed a pass.",
        supporting_facts=[], category="progression",
        bundle=bundle, allowed_categories=CATEGORIES,
    )
    assert result.ok, result.reasons


def test_unverified_number_rejected():
    _, _, _, bundle = _bundle()
    result = verify(
        title="t", body="A pass of 9999m.",
        supporting_facts=[], category="progression",
        bundle=bundle, allowed_categories=CATEGORIES,
    )
    assert not result.ok
    assert any("9999" in r for r in result.reasons)


def test_known_number_accepted():
    _, _, _, bundle = _bundle()
    result = verify(
        title="t", body="A pass of 30m.",
        supporting_facts=[], category="progression",
        bundle=bundle, allowed_categories=CATEGORIES,
    )
    assert result.ok, result.reasons


def test_unknown_category_rejected():
    _, _, _, bundle = _bundle()
    result = verify(
        title="t", body="ok", supporting_facts=[],
        category="made_up", bundle=bundle, allowed_categories=CATEGORIES,
    )
    assert not result.ok
