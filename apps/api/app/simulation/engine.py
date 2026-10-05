import random
from datetime import datetime, timedelta, timezone

from app.schemas.events import (
    DefensiveEvent,
    Event,
    MilestoneEvent,
    PassEvent,
    PossessionChangeEvent,
    ShotEvent,
    SprintEvent,
)
from app.simulation.roster import RosterTeam, default_teams
from app.simulation.scenarios import Scenario, get_scenario

MATCH_DURATION_MIN = 90
MATCH_START = datetime(2025, 1, 1, 15, 0, 0, tzinfo=timezone.utc)


class SimulationEngine:
    """Deterministic match simulator.

    Same (seed, scenario) → identical event stream (including IDs and timestamps).
    """

    def __init__(self, match_id: str, seed: int, scenario: str) -> None:
        self.match_id = match_id
        self.seed = seed
        self.scenario: Scenario = get_scenario(scenario)
        self.home, self.away = default_teams()

    # -- public API ---------------------------------------------------------

    def generate(self) -> list[Event]:
        rng = random.Random(self.seed)
        events: list[Event] = []
        seq = 0
        home_score = 0
        away_score = 0
        possession_team = self.home

        second = 0
        while second < MATCH_DURATION_MIN * 60:
            seq += 1
            minute = second // 60
            sec = second % 60
            ts = MATCH_START + timedelta(seconds=second)

            # Roughly one action every 4–10 seconds of match time.
            gap = rng.randint(4, 10)

            # Determine which side is acting.
            acting = possession_team
            other = self.away if acting is self.home else self.home
            bias = self._bias(acting, minute)

            # Choose action type.
            roll = rng.random()
            if roll < 0.70:
                ev = self._make_pass(seq, ts, minute, sec, acting, bias, rng)
                if isinstance(ev, PassEvent) and ev.completed and ev.distance_m > 30:
                    ev.event_type = "progressive_pass"
            elif roll < 0.82:
                ev = self._make_defensive(seq, ts, minute, sec, other, rng)
            elif roll < 0.90:
                ev = self._make_sprint(seq, ts, minute, sec, acting, rng)
            else:
                shot = self._make_shot(seq, ts, minute, sec, acting, bias, rng)
                ev = shot
                if isinstance(shot, ShotEvent) and shot.event_type == "goal":
                    if acting is self.home:
                        home_score += 1
                    else:
                        away_score += 1

            events.append(ev)
            second += gap

            # Occasional possession change.
            if rng.random() < 0.35:
                possession_team = other
                events.append(
                    PossessionChangeEvent(
                        event_id=f"{self.match_id}-e{seq:05d}-pc",
                        match_id=self.match_id,
                        timestamp=ts,
                        minute=minute,
                        second=sec,
                        team_id=other.id,
                        x=0.5,
                        y=0.5,
                        gained_by=other.id,
                    )
                )

        # Final whistle milestone.
        events.append(
            MilestoneEvent(
                event_id=f"{self.match_id}-final",
                match_id=self.match_id,
                timestamp=MATCH_START + timedelta(minutes=MATCH_DURATION_MIN),
                minute=MATCH_DURATION_MIN,
                second=0,
                team_id=self.home.id,
                x=0.5,
                y=0.5,
                label=f"FT {self.home.short_name} {home_score}-{away_score} {self.away.short_name}",
            )
        )
        return events

    # -- internals ----------------------------------------------------------

    def _bias(self, acting: RosterTeam, minute: int) -> float:
        s = self.scenario
        base = s.home_pass_bias if acting is self.home else s.away_pass_bias
        if s.late_swing and minute >= 70:
            # Trailing side (home if scoring less; simplified: home always swings late)
            base = min(0.95, base + 0.06) if acting is self.home else max(0.55, base - 0.06)
        return base

    def _pick_player(self, team: RosterTeam, rng: random.Random, prefer: str) -> str:
        candidates = [p for p in team.players if p.position == prefer]
        return rng.choice(candidates).id if candidates else rng.choice(team.players).id

    def _make_pass(
        self, seq: int, ts: datetime, minute: int, sec: int,
        team: RosterTeam, bias: float, rng: random.Random,
    ) -> PassEvent:
        start_x = rng.uniform(0.1, 0.8)
        start_y = rng.uniform(0.1, 0.9)
        distance = rng.uniform(5.0, 45.0)
        end_x = min(0.99, start_x + distance / 120.0)
        end_y = max(0.02, min(0.98, start_y + rng.uniform(-0.2, 0.2)))
        completed = rng.random() < bias
        difficulty = min(1.0, distance / 45.0 * (1.0 - bias * 0.4) + rng.uniform(0.0, 0.15))
        return PassEvent(
            event_id=f"{self.match_id}-e{seq:05d}",
            match_id=self.match_id,
            timestamp=ts,
            minute=minute,
            second=sec,
            team_id=team.id,
            player_id=self._pick_player(team, rng, "MF"),
            x=start_x, y=start_y,
            event_type="pass",
            distance_m=round(distance, 2),
            completed=completed,
            difficulty=round(difficulty, 3),
            end_x=round(end_x, 3),
            end_y=round(end_y, 3),
        )

    def _make_defensive(
        self, seq: int, ts: datetime, minute: int, sec: int,
        team: RosterTeam, rng: random.Random,
    ) -> DefensiveEvent:
        won = rng.random() < 0.55
        etype = rng.choices(
            ["tackle", "interception", "pressure", "foul"],
            weights=[0.35, 0.30, 0.28, 0.07],
        )[0]
        return DefensiveEvent(
            event_id=f"{self.match_id}-e{seq:05d}",
            match_id=self.match_id,
            timestamp=ts,
            minute=minute,
            second=sec,
            team_id=team.id,
            player_id=self._pick_player(team, rng, "DF"),
            x=rng.uniform(0.2, 0.9),
            y=rng.uniform(0.1, 0.9),
            event_type=etype,  # type: ignore[arg-type]
            won=won,
        )

    def _make_shot(
        self, seq: int, ts: datetime, minute: int, sec: int,
        team: RosterTeam, bias: float, rng: random.Random,
    ) -> ShotEvent:
        distance = rng.uniform(6.0, 32.0)
        speed = rng.uniform(45.0, 120.0)
        on_target = rng.random() < 0.45
        is_goal = on_target and rng.random() < (0.32 * bias + 0.05)
        return ShotEvent(
            event_id=f"{self.match_id}-e{seq:05d}",
            match_id=self.match_id,
            timestamp=ts,
            minute=minute,
            second=sec,
            team_id=team.id,
            player_id=self._pick_player(team, rng, "FW"),
            x=rng.uniform(0.65, 0.95),
            y=rng.uniform(0.2, 0.8),
            event_type="goal" if is_goal else "shot",
            distance_m=round(distance, 2),
            speed_kmh=round(speed, 1),
            on_target=on_target,
        )

    def _make_sprint(
        self, seq: int, ts: datetime, minute: int, sec: int,
        team: RosterTeam, rng: random.Random,
    ) -> SprintEvent:
        return SprintEvent(
            event_id=f"{self.match_id}-e{seq:05d}",
            match_id=self.match_id,
            timestamp=ts,
            minute=minute,
            second=sec,
            team_id=team.id,
            player_id=self._pick_player(team, rng, "FW"),
            x=rng.uniform(0.2, 0.9),
            y=rng.uniform(0.1, 0.9),
            event_type="sprint",
            speed_kmh=round(rng.uniform(24.0, 36.0), 1),
        )
