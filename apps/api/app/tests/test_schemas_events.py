from datetime import UTC, datetime

import pytest
from pydantic import TypeAdapter, ValidationError

from app.schemas.events import Event, PassEvent

adapter = TypeAdapter(Event)


def test_pass_event_roundtrip():
    ev = PassEvent(
        event_id="e1", match_id="m1",
        timestamp=datetime(2025, 1, 1, tzinfo=UTC),
        minute=10, second=30, team_id="HOME", player_id="HOME-p06",
        x=0.3, y=0.4,
        event_type="pass", distance_m=22.5, completed=True,
        difficulty=0.4, end_x=0.55, end_y=0.5,
    )
    parsed = adapter.validate_python(ev.model_dump())
    assert isinstance(parsed, PassEvent)
    assert parsed.distance_m == 22.5


def test_invalid_minute_rejected():
    with pytest.raises(ValidationError):
        adapter.validate_python({
            "event_id": "e1", "match_id": "m1",
            "timestamp": "2025-01-01T00:00:00Z",
            "minute": 999, "second": 0, "team_id": "HOME",
            "x": 0.5, "y": 0.5,
            "event_type": "pass", "distance_m": 10, "completed": True,
            "difficulty": 0.2, "end_x": 0.6, "end_y": 0.5,
        })
