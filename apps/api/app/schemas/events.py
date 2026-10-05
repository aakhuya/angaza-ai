from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


class _BaseEvent(BaseModel):
    event_id: str
    match_id: str
    timestamp: datetime
    minute: int = Field(ge=0, le=120)
    second: int = Field(ge=0, le=59)
    team_id: str
    player_id: str | None = None
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)


class PassEvent(_BaseEvent):
    event_type: Literal["pass", "progressive_pass"] = "pass"
    distance_m: float = Field(ge=0.0, le=120.0)
    completed: bool
    difficulty: float = Field(ge=0.0, le=1.0)
    end_x: float = Field(ge=0.0, le=1.0)
    end_y: float = Field(ge=0.0, le=1.0)


class ShotEvent(_BaseEvent):
    event_type: Literal["shot", "goal"] = "shot"
    distance_m: float = Field(ge=0.0, le=60.0)
    speed_kmh: float = Field(ge=0.0, le=160.0)
    on_target: bool


class DefensiveEvent(_BaseEvent):
    event_type: Literal["tackle", "interception", "pressure", "foul"]
    won: bool


class PossessionChangeEvent(_BaseEvent):
    event_type: Literal["possession_change"] = "possession_change"
    gained_by: str


class SubstitutionEvent(_BaseEvent):
    event_type: Literal["substitution"] = "substitution"
    player_off_id: str
    player_on_id: str


class SprintEvent(_BaseEvent):
    event_type: Literal["sprint"] = "sprint"
    speed_kmh: float = Field(ge=0.0, le=40.0)


class MilestoneEvent(_BaseEvent):
    event_type: Literal["milestone"] = "milestone"
    label: str


Event = Annotated[
    Union[
        PassEvent,
        ShotEvent,
        DefensiveEvent,
        PossessionChangeEvent,
        SubstitutionEvent,
        SprintEvent,
        MilestoneEvent,
    ],
    Field(discriminator="event_type"),
]
