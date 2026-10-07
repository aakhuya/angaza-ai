from dataclasses import dataclass, field
from typing import Any

from app.analytics.state import ImportanceScore, MatchState
from app.schemas.events import Event


@dataclass(frozen=True)
class FactBundle:
    """Structured, validated input for agents.

    Every field here is derived from deterministic analytics. Agents reason
    over these facts only. Verification later asserts every claim in the
    agent output is grounded in one of these values.
    """

    match_id: str
    minute: int
    second: int
    event: dict[str, Any]
    importance_score: float
    importance_reasons: tuple[str, ...]
    home_team_id: str
    away_team_id: str
    home_score: int
    away_score: int
    home_stats: dict[str, Any]
    away_stats: dict[str, Any]
    event_team_stats: dict[str, Any]
    event_player: dict[str, Any] | None
    momentum: list[dict[str, Any]]
    known_player_ids: frozenset[str] = field(default_factory=frozenset)
    known_team_ids: frozenset[str] = field(default_factory=frozenset)

    def to_prompt_json(self) -> dict[str, Any]:
        return {
            "match_id": self.match_id,
            "minute": self.minute,
            "second": self.second,
            "event": self.event,
            "importance": {
                "score": self.importance_score,
                "reasons": list(self.importance_reasons),
            },
            "score": {"home": self.home_score, "away": self.away_score},
            "teams": {"home": self.home_team_id, "away": self.away_team_id},
            "event_team_stats": self.event_team_stats,
            "event_player": self.event_player,
            "opponent_stats": self._opponent_stats(),
        }

    def _opponent_stats(self) -> dict[str, Any]:
        home = self.event_team_stats.get("team_id") == self.home_team_id
        return self.away_stats if home else self.home_stats


def build_fact_bundle(
    event: Event,
    state: MatchState,
    importance: ImportanceScore,
) -> FactBundle:
    event_team_stats = (
        state.home.model_dump() if event.team_id == state.home.team_id
        else state.away.model_dump() if event.team_id == state.away.team_id
        else {}
    )
    player = None
    if event.player_id and event.player_id in state.players:
        player = state.players[event.player_id].model_dump()

    return FactBundle(
        match_id=state.match_id,
        minute=event.minute,
        second=event.second,
        event=event.model_dump(mode="json"),
        importance_score=importance.score,
        importance_reasons=tuple(importance.reasons),
        home_team_id=state.home.team_id,
        away_team_id=state.away.team_id,
        home_score=state.home_score,
        away_score=state.away_score,
        home_stats=state.home.model_dump(),
        away_stats=state.away.model_dump(),
        event_team_stats=event_team_stats,
        event_player=player,
        momentum=[m.model_dump() for m in state.momentum[-6:]],
        known_player_ids=frozenset(state.players.keys()),
        known_team_ids=frozenset({state.home.team_id, state.away.team_id}),
    )
