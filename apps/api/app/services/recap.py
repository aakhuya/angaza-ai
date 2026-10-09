from app.analytics.state import MatchState
from app.schemas.stream import InsightEnvelope


def build_recap(state: MatchState, insights: list[InsightEnvelope]) -> dict:
    home, away = state.home, state.away
    winner = _winner(state)
    turning_point = _turning_point(insights)

    return {
        "match_id": state.match_id,
        "final_score": {
            "home": state.home_score,
            "away": state.away_score,
        },
        "story": _story(state, winner),
        "tactical_story": _tactical_story(state),
        "key_moments": [
            {
                "minute": i.minute,
                "category": i.category,
                "title": i.title,
                "body": i.body,
                "confidence": i.confidence,
            }
            for i in _top_moments(insights, limit=6)
        ],
        "standout_players": _standout_players(state),
        "turning_point": turning_point,
        "statistics": {
            "possession": [home.possession_pct, away.possession_pct],
            "shots": [home.shots, away.shots],
            "shots_on_target": [home.shots_on_target, away.shots_on_target],
            "progressive_passes": [home.progressive_passes, away.progressive_passes],
            "final_third_entries": [home.final_third_entries, away.final_third_entries],
            "pressures": [home.pressures, away.pressures],
        },
    }


def _winner(state: MatchState) -> str:
    if state.home_score > state.away_score:
        return state.home.team_id
    if state.away_score > state.home_score:
        return state.away.team_id
    return "draw"


def _story(state: MatchState, winner: str) -> str:
    home, away = state.home, state.away
    total_shots = home.shots + away.shots
    if winner == "draw":
        lead = f"The match finished level at {state.home_score}-{state.away_score}."
    else:
        hi = max(state.home_score, state.away_score)
        lo = min(state.home_score, state.away_score)
        lead = f"{winner} finished {hi}-{lo}."
    possession_lead = (
        f"{home.team_id} controlled {home.possession_pct:.0f}% of possession."
        if home.possession_pct >= away.possession_pct
        else f"{away.team_id} controlled {away.possession_pct:.0f}% of possession."
    )
    shots_line = f"Combined shots: {total_shots}."
    return f"{lead} {possession_lead} {shots_line}"


def _tactical_story(state: MatchState) -> str:
    home, away = state.home, state.away
    progressor = (
        home.team_id
        if home.progressive_passes >= away.progressive_passes
        else away.team_id
    )
    pressor = home.team_id if home.pressures >= away.pressures else away.team_id
    return (
        f"{progressor} progressed the ball more often through the lines. "
        f"{pressor} applied the greater share of pressure actions."
    )


def _top_moments(insights: list[InsightEnvelope], limit: int) -> list[InsightEnvelope]:
    ranked = sorted(insights, key=lambda i: (-i.confidence, i.minute))
    return ranked[:limit]


def _standout_players(state: MatchState) -> list[dict]:
    ranked = sorted(state.players.values(), key=lambda p: p.involvement_score, reverse=True)[:5]
    return [
        {
            "player_id": p.player_id,
            "team_id": p.team_id,
            "involvement_score": p.involvement_score,
            "goals": p.goals,
            "shots": p.shots,
            "progressive_passes": p.progressive_passes,
            "defensive_actions": p.defensive_actions,
        }
        for p in ranked
        if p.involvement_score > 0
    ]


def _turning_point(insights: list[InsightEnvelope]) -> dict | None:
    if not insights:
        return None
    # Prefer an insight in the last third of the match with the highest confidence.
    late = [i for i in insights if i.minute >= 60] or insights
    pick = max(late, key=lambda i: i.confidence)
    return {
        "minute": pick.minute,
        "title": pick.title,
        "body": pick.body,
        "category": pick.category,
    }
