from collections import defaultdict

from app.analytics.state import (
    ImportanceScore,
    MatchState,
    MomentumPoint,
    PlayerStats,
    TeamStats,
)
from app.schemas.events import (
    DefensiveEvent,
    Event,
    MilestoneEvent,
    PassEvent,
    PossessionChangeEvent,
    ShotEvent,
    SprintEvent,
)

FINAL_THIRD_X = 0.66
PROGRESSIVE_PASS_MIN_M = 25.0


def compute_state(
    match_id: str,
    events: list[Event],
    home_team_id: str | None = None,
    away_team_id: str | None = None,
) -> MatchState:
    if home_team_id is None or away_team_id is None:
        inferred_home, inferred_away = _infer_team_ids(events)
        home_team_id = home_team_id or inferred_home
        away_team_id = away_team_id or inferred_away

    home = TeamStats(team_id=home_team_id)
    away = TeamStats(team_id=away_team_id)
    players: dict[str, PlayerStats] = {}

    home_poss_seconds = 0.0
    away_poss_seconds = 0.0
    last_possession_team: str | None = None
    last_timestamp = None

    momentum_buckets: dict[int, dict[str, float]] = defaultdict(lambda: {"home": 0.0, "away": 0.0})

    for ev in events:
        if last_timestamp is not None and last_possession_team is not None:
            dt = (ev.timestamp - last_timestamp).total_seconds()
            if last_possession_team == home_team_id:
                home_poss_seconds += dt
            elif last_possession_team == away_team_id:
                away_poss_seconds += dt

        bucket = ev.minute // 5
        if ev.team_id == home_team_id:
            momentum_buckets[bucket]["home"] += _event_momentum(ev)
        elif ev.team_id == away_team_id:
            momentum_buckets[bucket]["away"] += _event_momentum(ev)

        team_stats = (
            home if ev.team_id == home_team_id
            else away if ev.team_id == away_team_id
            else None
        )
        if team_stats is None:
            last_timestamp = ev.timestamp
            continue

        if isinstance(ev, PassEvent):
            team_stats.passes_attempted += 1
            if ev.completed:
                team_stats.passes_completed += 1
                if ev.distance_m >= PROGRESSIVE_PASS_MIN_M or ev.end_x >= FINAL_THIRD_X:
                    team_stats.progressive_passes += 1
                if ev.end_x >= FINAL_THIRD_X and ev.x < FINAL_THIRD_X:
                    team_stats.final_third_entries += 1
            _player(players, ev.player_id, ev.team_id).passes_completed += int(ev.completed)
            is_progressive = (
                ev.distance_m >= PROGRESSIVE_PASS_MIN_M or ev.end_x >= FINAL_THIRD_X
            )
            if ev.completed and is_progressive:
                _player(players, ev.player_id, ev.team_id).progressive_passes += 1

        elif isinstance(ev, ShotEvent):
            team_stats.shots += 1
            if ev.on_target:
                team_stats.shots_on_target += 1
            if ev.event_type == "goal":
                team_stats.goals += 1
            ps = _player(players, ev.player_id, ev.team_id)
            ps.shots += 1
            ps.goals += int(ev.event_type == "goal")

        elif isinstance(ev, DefensiveEvent):
            if ev.won:
                if ev.event_type == "tackle":
                    team_stats.tackles_won += 1
                elif ev.event_type == "interception":
                    team_stats.interceptions += 1
            if ev.event_type == "pressure":
                team_stats.pressures += 1
            if ev.won and ev.event_type in ("tackle", "interception"):
                _player(players, ev.player_id, ev.team_id).defensive_actions += 1

        elif isinstance(ev, PossessionChangeEvent):
            gained = ev.gained_by
            if gained == home_team_id:
                home.possession_recoveries += 1
            elif gained == away_team_id:
                away.possession_recoveries += 1
            last_possession_team = gained

        elif isinstance(ev, SprintEvent):
            ps = _player(players, ev.player_id, ev.team_id)
            ps.distance_covered_m += ev.speed_kmh * 1000 / 3600 * 3

        if not isinstance(ev, PossessionChangeEvent):
            last_possession_team = ev.team_id

        last_timestamp = ev.timestamp

    total_poss = home_poss_seconds + away_poss_seconds
    if total_poss > 0:
        home.possession_pct = round(home_poss_seconds / total_poss * 100, 1)
        away.possession_pct = round(away_poss_seconds / total_poss * 100, 1)

    for ts in (home, away):
        if ts.passes_attempted:
            ts.pass_accuracy = round(ts.passes_completed / ts.passes_attempted * 100, 1)

    for ps in players.values():
        ps.involvement_score = round(
            ps.passes_completed * 1.0
            + ps.progressive_passes * 2.5
            + ps.shots * 3.0
            + ps.goals * 8.0
            + ps.defensive_actions * 1.5
            + ps.distance_covered_m / 100.0,
            2,
        )

    momentum = _compute_momentum(momentum_buckets)
    last = events[-1] if events else None

    return MatchState(
        match_id=match_id,
        minute=last.minute if last else 0,
        second=last.second if last else 0,
        home_score=home.goals,
        away_score=away.goals,
        home=home,
        away=away,
        players=players,
        momentum=momentum,
        total_events=len(events),
    )


def score_importance(ev: Event, state: MatchState) -> ImportanceScore:
    score = 0.0
    reasons: list[str] = []

    if isinstance(ev, ShotEvent):
        if ev.event_type == "goal":
            score = 1.0
            reasons.append("goal")
        elif ev.on_target:
            score = 0.75
            reasons.append("shot_on_target")
        else:
            score = 0.35
            reasons.append("shot_off_target")

    elif isinstance(ev, PassEvent):
        if ev.completed and (ev.distance_m >= PROGRESSIVE_PASS_MIN_M or ev.end_x >= FINAL_THIRD_X):
            score = 0.55 if ev.difficulty >= 0.5 else 0.45
            reasons.append("progressive_pass")
            if ev.end_x >= FINAL_THIRD_X and ev.x < FINAL_THIRD_X:
                reasons.append("final_third_entry")
        elif ev.completed and ev.difficulty >= 0.7:
            score = 0.35
            reasons.append("high_difficulty_pass")

    elif isinstance(ev, DefensiveEvent):
        if ev.event_type == "interception" and ev.won:
            score = 0.35
            reasons.append("interception_won")
        elif ev.event_type == "tackle" and ev.won:
            score = 0.30
            reasons.append("tackle_won")
        elif ev.event_type == "pressure" and ev.x >= FINAL_THIRD_X:
            score = 0.30
            reasons.append("high_pressure_attacking_third")

    elif isinstance(ev, MilestoneEvent):
        score = 0.65
        reasons.append("milestone")

    if ev.minute >= 80 and score > 0:
        score = min(1.0, score + 0.10)
        reasons.append("late_game")

    return ImportanceScore(event_id=ev.event_id, score=round(score, 3), reasons=reasons)


def _player(players: dict[str, PlayerStats], player_id: str | None, team_id: str) -> PlayerStats:
    key = player_id or f"{team_id}-team"
    if key not in players:
        players[key] = PlayerStats(player_id=key, team_id=team_id)
    return players[key]


def _infer_team_ids(events: list[Event]) -> tuple[str, str]:
    seen: list[str] = []
    for ev in events:
        if ev.team_id not in seen:
            seen.append(ev.team_id)
        if len(seen) == 2:
            break
    if not seen:
        return "HOME", "AWAY"
    if len(seen) == 1:
        other = "AWAY" if seen[0] == "HOME" else "HOME"
        return seen[0], other
    return seen[0], seen[1]


def _event_momentum(ev: Event) -> float:
    if isinstance(ev, ShotEvent):
        return 3.0 if ev.event_type == "goal" else (2.0 if ev.on_target else 1.0)
    if isinstance(ev, PassEvent) and ev.completed and ev.end_x >= FINAL_THIRD_X:
        return 1.0
    if isinstance(ev, DefensiveEvent) and ev.won:
        return 0.5
    if isinstance(ev, PossessionChangeEvent):
        return 0.3
    return 0.05


def _compute_momentum(buckets: dict[int, dict[str, float]]) -> list[MomentumPoint]:
    if not buckets:
        return []
    max_minute = max(buckets) * 5 + 5
    points: list[MomentumPoint] = []
    for b in range(0, max_minute // 5 + 1):
        row = buckets.get(b, {"home": 0.0, "away": 0.0})
        points.append(
            MomentumPoint(
                minute=b * 5,
                home=round(row["home"], 2),
                away=round(row["away"], 2),
            )
        )
    return points
