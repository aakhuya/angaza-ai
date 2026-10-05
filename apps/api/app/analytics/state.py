from pydantic import BaseModel, Field


class TeamStats(BaseModel):
    team_id: str
    possession_pct: float = 0.0
    passes_attempted: int = 0
    passes_completed: int = 0
    pass_accuracy: float = 0.0
    progressive_passes: int = 0
    final_third_entries: int = 0
    shots: int = 0
    shots_on_target: int = 0
    goals: int = 0
    tackles_won: int = 0
    interceptions: int = 0
    pressures: int = 0
    possession_recoveries: int = 0


class PlayerStats(BaseModel):
    player_id: str
    team_id: str
    passes_completed: int = 0
    progressive_passes: int = 0
    shots: int = 0
    goals: int = 0
    defensive_actions: int = 0
    distance_covered_m: float = 0.0
    involvement_score: float = 0.0


class MomentumPoint(BaseModel):
    minute: int
    home: float
    away: float


class MatchState(BaseModel):
    match_id: str
    minute: int = 0
    second: int = 0
    home_score: int = 0
    away_score: int = 0
    home: TeamStats
    away: TeamStats
    players: dict[str, PlayerStats] = Field(default_factory=dict)
    momentum: list[MomentumPoint] = Field(default_factory=list)
    total_events: int = 0


class ImportanceScore(BaseModel):
    event_id: str
    score: float = Field(ge=0.0, le=1.0)
    reasons: list[str] = Field(default_factory=list)
