import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


def _uuid() -> str:
    return str(uuid.uuid4())


class LiveMatch(Base, TimestampMixin):
    """One row per in-flight match.

    The runner registry is per-process memory, which does not survive across
    Vercel function instances. This table is the shared source of truth for
    "which matches are running right now" — any instance can read it.
    """

    __tablename__ = "live_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    match_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    scenario: Mapped[str] = mapped_column(String(32))
    seed: Mapped[int] = mapped_column(default=42)
    viewer_mode: Mapped[str] = mapped_column(String(20), default="analyst")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
