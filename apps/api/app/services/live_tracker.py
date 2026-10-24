from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select

from app.models.live import LiveMatch
from app.models.session import SessionLocal

# A match is considered "live" for this long after it starts. 10 minutes is
# generous for our 600x-speed demo (a real match runs in ~30s), and safely
# covers slow cold starts on free-tier serverless.
LIVE_TTL = timedelta(minutes=10)


def mark_live(match_id: str, scenario: str, seed: int, viewer_mode: str) -> None:
    now = datetime.now(UTC)
    db = SessionLocal()
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
    db = SessionLocal()
    try:
        db.execute(delete(LiveMatch).where(LiveMatch.match_id == match_id))
        db.commit()
    finally:
        db.close()


def list_live() -> list[dict]:
    now = datetime.now(UTC)
    db = SessionLocal()
    try:
        # Purge rows that have expired but weren't cleaned up (Vercel killed the runner).
        db.execute(delete(LiveMatch).where(LiveMatch.expires_at < now))
        db.commit()

        rows = db.scalars(
            select(LiveMatch).where(LiveMatch.expires_at > now).order_by(LiveMatch.started_at.desc())
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
