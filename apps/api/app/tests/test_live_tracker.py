"""Tests for the live-matches tracker.

These run first in a fresh process, so if `SessionLocal` is bound at module
import time anywhere, they will fail before the runner integration test does.
"""
from datetime import datetime, timezone

from app.services import live_tracker


def test_mark_and_list_live():
    live_tracker.mark_live("t1", "balanced", 42, "analyst")
    live_tracker.mark_finished("t1")

    live_tracker.mark_live("t2", "high_press", 7, "analyst")
    rows = live_tracker.list_live()
    assert any(r["match_id"] == "t2" for r in rows)

    live_tracker.mark_finished("t2")
    rows = live_tracker.list_live()
    assert not any(r["match_id"] == "t2" for r in rows)
