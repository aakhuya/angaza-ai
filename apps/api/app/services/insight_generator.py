"""Deterministic stub insight generator.

Phase 6 replaces the body of ``generate`` with the agent pipeline. The
interface — (event, state, importance, viewer_mode) -> InsightEnvelope — is
frozen so the runner and SSE endpoint do not need to change.
"""

from uuid import uuid4

from app.analytics.state import ImportanceScore, MatchState
from app.schemas.events import Event, PassEvent, ShotEvent
from app.schemas.stream import InsightEnvelope

_CATEGORY_BY_REASON = {
    "goal": "key_moment",
    "shot_on_target": "chance",
    "shot_off_target": "chance",
    "progressive_pass": "progression",
    "final_third_entry": "progression",
    "high_difficulty_pass": "progression",
    "interception_won": "defensive",
    "tackle_won": "defensive",
    "high_pressure_attacking_third": "pressure",
    "milestone": "milestone",
    "late_game": "context",
}


def generate(
    event: Event,
    state: MatchState,
    importance: ImportanceScore,
    viewer_mode: str = "analyst",
) -> InsightEnvelope:
    category = _category(importance)
    title = _title(event, category)
    body = _body(event, state, category, viewer_mode)

    return InsightEnvelope(
        insight_id=str(uuid4()),
        match_id=state.match_id,
        minute=event.minute,
        second=event.second,
        category=category,
        title=title,
        body=body,
        viewer_mode=viewer_mode,
        supporting_event_ids=[event.event_id],
        confidence=min(1.0, 0.6 + importance.score * 0.4),
    )


def _category(importance: ImportanceScore) -> str:
    for reason in importance.reasons:
        if reason in _CATEGORY_BY_REASON:
            return _CATEGORY_BY_REASON[reason]
    return "context"


def _title(event: Event, category: str) -> str:
    team = event.team_id
    if isinstance(event, ShotEvent) and event.event_type == "goal":
        return f"{team} score"
    if isinstance(event, ShotEvent) and event.on_target:
        return f"{team} force a save"
    if isinstance(event, PassEvent) and event.distance_m >= 25:
        return f"{team} break the lines"
    if category == "defensive":
        return f"{team} win it back"
    if category == "pressure":
        return f"{team} ramp up the press"
    return f"{team} moment"


def _body(event: Event, state: MatchState, category: str, viewer_mode: str) -> str:
    home = state.home
    away = state.away
    context = (
        f"Possession {home.team_id} {home.possession_pct:.0f}% / "
        f"{away.team_id} {away.possession_pct:.0f}%."
    )

    if isinstance(event, ShotEvent) and event.event_type == "goal":
        detail = (
            f"Goal from {event.distance_m:.0f}m at {event.speed_kmh:.0f}km/h."
        )
    elif isinstance(event, PassEvent):
        detail = (
            f"{event.distance_m:.0f}m pass into the final third." if event.end_x >= 0.66
            else f"{event.distance_m:.0f}m pass."
        )
    else:
        detail = f"{event.event_type.replace('_', ' ')} by {event.team_id}."

    if viewer_mode == "casual":
        return f"{detail} {event.team_id} are building momentum. {context}"
    if viewer_mode == "player_focus":
        who = event.player_id or "the team"
        return f"{who}: {detail} {context}"
    return f"{detail} {context}"
