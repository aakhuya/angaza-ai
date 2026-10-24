"""Live matches tracker.

Records in-flight matches in the database so the state persists across
Vercel function instances. Reads from `live_matches` table.
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select

from app.models.live import LiveMatch

# A match is considered "live" for this long after it starts. 10 minutes
# comfortably covers a full simulated match at 600x speed (a real match
# runs in ~30 seconds of wall clock).
LIVE_TTL = timedelta(minutes=10)


def _session():
    """Late-bind SessionLocal so pytest fixtures can replace the engine.

    `from app.models.session import SessionLocal` at module level binds the
    name once, at import time. If a test fixture later rebinds
    `session_mod.SessionLocal`, this module would still be using the old
    engine and fail with "no such table". Importing inside `_session()`
    means we always use whatever is current.
    """
    from app.models.session import SessionLocal

    return SessionLocal()


def mark_live(match_id: str, scenario: str, seed: int, viewer_mode: str) -> None:
    now = datetime.now(UTC)
    db = _session()
    try:
        existing = db.scalar(select(LiveMatch).where(LiveMatch.match_id == match_id))
        if existing is not None:
            existing.started_at = now
            existing.expires_at = now + LIVE_TTL
            existing.scenario = scenario
            existing.seed = seed
            existing.viewer_mode = viewer_mode
        else:
            db.add(
                LiveMatch(
                    match_id=match_id,
                    scenario=scenario,
                    seed=seed,
                    viewer_mode=viewer_mode,
                    started_at=now,
                    expires_at=now + LIVE_TTL,
                )
            )
        db.commit()
    finally:
        db.close()


def mark_finished(match_id: str) -> None:
    db = _session()
    try:
        db.execute(delete(LiveMatch).where(LiveMatch.match_id == match_id))
        db.commit()
    finally:
        db.close()


def list_live() -> list[dict]:
    now = datetime.now(UTC)
    db = _session()
    try:
        # Purge expired rows first.
        db.execute(delete(LiveMatch).where(LiveMatch.expires_at < now))
        db.commit()

        rows = db.scalars(
            select(LiveMatch)
            .where(LiveMatch.expires_at > now)
            .order_by(LiveMatch.started_at.desc())
        ).all()

        return [
            {
                "match_id": r.match_id,
                "scenario": r.scenario,
                "seed": r.seed,
                "viewer_mode": r.viewer_mode,
                "started_at": r.started_at.isoformat() if r.started_at else None,
            }
            for r in rows
        ]
    finally:
        db.close()
