from datetime import datetime, timedelta, timezone

from app.analytics.compute import compute_state, score_importance
from app.schemas.events import (
    DefensiveEvent,
    PassEvent,
    PossessionChangeEvent,
    ShotEvent,
)

T0 = datetime(2025, 1, 1, 15, 0, 0, tzinfo=timezone.utc)


def _pass(seq, sec, team, player, dist, completed, end_x=0.5, x=0.4, etype="pass"):
    return PassEvent(
        event_id=f"e{seq}", match_id="m1", timestamp=T0 + timedelta(seconds=sec),
        minute=sec // 60, second=sec % 60, team_id=team, player_id=player,
        x=x, y=0.5, event_type=etype, distance_m=dist, completed=completed,
        difficulty=0.4, end_x=end_x, end_y=0.5,
    )


def test_possession_and_pass_accuracy_hand_computed():
    # HOME events at t=0, 6; AWAY event at t=12; final at t=18 for closure.
    events = [
        _pass(1, 0, "HOME", "H1", 10, True),
        _pass(2, 6, "HOME", "H1", 30, True, end_x=0.7),
        _pass(3, 12, "AWAY", "A1", 8, False),
        _pass(4, 18, "HOME", "H1", 5, True),
    ]
    state = compute_state("m1", events)
    # Home possession: 12s of 18s total = 66.7%
    assert abs(state.home.possession_pct - 66.7) < 0.2
    assert abs(state.away.possession_pct - 33.3) < 0.2
    # Home passes: 3 attempted, 3 completed = 100%; progressive = 1 (30m)
    assert state.home.passes_attempted == 3
    assert state.home.passes_completed == 3
    assert state.home.pass_accuracy == 100.0
    assert state.home.progressive_passes == 1
    assert state.away.passes_attempted == 1
    assert state.away.pass_accuracy == 0.0


def test_shots_and_goals():
    events = [
        ShotEvent(event_id="s1", match_id="m1", timestamp=T0, minute=0, second=0,
                  team_id="HOME", player_id="H1", x=0.8, y=0.5,
                  event_type="shot", distance_m=18, speed_kmh=90, on_target=True),
        ShotEvent(event_id="s2", match_id="m1", timestamp=T0 + timedelta(seconds=5),
                  minute=0, second=5, team_id="HOME", player_id="H1", x=0.85, y=0.5,
                  event_type="goal", distance_m=12, speed_kmh=95, on_target=True),
        ShotEvent(event_id="s3", match_id="m1", timestamp=T0 + timedelta(seconds=12),
                  minute=0, second=12, team_id="AWAY", player_id="A1", x=0.7, y=0.5,
                  event_type="shot", distance_m=22, speed_kmh=85, on_target=False),
    ]
    state = compute_state("m1", events)
    assert state.home.shots == 2
    assert state.home.shots_on_target == 2
    assert state.home.goals == 1
    assert state.home_score == 1
    assert state.away.shots == 1
    assert state.away.shots_on_target == 0


def test_final_third_entries_counted_on_crossing():
    events = [
        _pass(1, 0, "HOME", "H1", 10, True, x=0.5, end_x=0.7),   # crosses → entry
        _pass(2, 6, "HOME", "H1", 5, True, x=0.7, end_x=0.75),   # already in → no entry
        _pass(3, 12, "HOME", "H1", 8, False, x=0.5, end_x=0.7),  # incomplete → no entry
    ]
    state = compute_state("m1", events)
    assert state.home.final_third_entries == 1


def test_defensive_and_possession_recovery():
    events = [
        DefensiveEvent(event_id="d1", match_id="m1", timestamp=T0, minute=0, second=0,
                       team_id="AWAY", player_id="A1", x=0.4, y=0.5,
                       event_type="tackle", won=True),
        DefensiveEvent(event_id="d2", match_id="m1", timestamp=T0 + timedelta(seconds=4),
                       minute=0, second=4, team_id="AWAY", player_id="A1", x=0.4, y=0.5,
                       event_type="interception", won=True),
        DefensiveEvent(event_id="d3", match_id="m1", timestamp=T0 + timedelta(seconds=8),
                       minute=0, second=8, team_id="AWAY", player_id="A1", x=0.8, y=0.5,
                       event_type="pressure", won=False),
        PossessionChangeEvent(event_id="pc1", match_id="m1",
                              timestamp=T0 + timedelta(seconds=10), minute=0, second=10,
                              team_id="AWAY", x=0.5, y=0.5, gained_by="AWAY"),
    ]
    state = compute_state("m1", events, home_team_id="HOME", away_team_id="AWAY")
    assert state.away.tackles_won == 1
    assert state.away.interceptions == 1
    assert state.away.pressures == 1
    assert state.away.possession_recoveries == 1


def test_player_involvement_reflects_actions():
    events = [
        _pass(1, 0, "HOME", "H1", 10, True),
        _pass(2, 4, "HOME", "H1", 35, True, end_x=0.75),  # progressive
        ShotEvent(event_id="s1", match_id="m1", timestamp=T0 + timedelta(seconds=10),
                  minute=0, second=10, team_id="HOME", player_id="H1", x=0.85, y=0.5,
                  event_type="goal", distance_m=10, speed_kmh=100, on_target=True),
    ]
    state = compute_state("m1", events)
    h1 = state.players["H1"]
    assert h1.passes_completed == 2
    assert h1.progressive_passes == 1
    assert h1.goals == 1
    # 2*1 + 1*2.5 + 1*3 + 1*8 = 15.5 (distance contribution ignored for goal-less sprint)
    assert h1.involvement_score >= 15.0


def test_importance_goal_is_max():
    events = [
        ShotEvent(event_id="s1", match_id="m1", timestamp=T0, minute=0, second=0,
                  team_id="HOME", player_id="H1", x=0.8, y=0.5,
                  event_type="goal", distance_m=12, speed_kmh=100, on_target=True),
    ]
    state = compute_state("m1", events)
    score = score_importance(events[0], state)
    assert score.score == 1.0
    assert "goal" in score.reasons


def test_importance_progressive_pass_mid_range():
    ev = _pass(1, 0, "HOME", "H1", 30, True, x=0.5, end_x=0.72)
    state = compute_state("m1", [ev])
    score = score_importance(ev, state)
    assert 0.4 <= score.score <= 0.6
    assert "progressive_pass" in score.reasons
    assert "final_third_entry" in score.reasons


def test_importance_late_game_boost():
    ev = ShotEvent(event_id="s1", match_id="m1",
                   timestamp=T0 + timedelta(minutes=85), minute=85, second=0,
                   team_id="HOME", player_id="H1", x=0.8, y=0.5,
                   event_type="shot", distance_m=18, speed_kmh=90, on_target=True)
    state = compute_state("m1", [ev])
    score = score_importance(ev, state)
    assert score.score >= 0.8
    assert "late_game" in score.reasons


def test_empty_stream_is_safe():
    state = compute_state("m1", [])
    assert state.total_events == 0
    assert state.home.possession_pct == 0.0
    assert state.momentum == []
