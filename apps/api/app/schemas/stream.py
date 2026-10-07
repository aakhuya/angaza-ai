from typing import Annotated, Literal

from pydantic import BaseModel, Field

from app.analytics.state import ImportanceScore, MatchState
from app.schemas.events import Event


class EventEnvelope(BaseModel):
    type: Literal["event"] = "event"
    event: Event


class StateEnvelope(BaseModel):
    type: Literal["state"] = "state"
    state: MatchState


class InsightEnvelope(BaseModel):
    type: Literal["insight"] = "insight"
    insight_id: str
    match_id: str
    minute: int
    second: int
    category: str
    title: str
    body: str
    viewer_mode: str
    supporting_event_ids: list[str] = Field(default_factory=list)
    confidence: float = 1.0


class ImportanceEnvelope(BaseModel):
    type: Literal["importance"] = "importance"
    importance: ImportanceScore


class StatusEnvelope(BaseModel):
    type: Literal["status"] = "status"
    status: Literal["scheduled", "live", "paused", "finished"]
    minute: int = 0
    second: int = 0


Envelope = Annotated[
    EventEnvelope | StateEnvelope | InsightEnvelope | ImportanceEnvelope | StatusEnvelope,
    Field(discriminator="type"),
]
