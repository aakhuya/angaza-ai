import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


def _uuid() -> str:
    return str(uuid.uuid4())


class Team(Base, TimestampMixin):
    __tablename__ = "teams"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    short_name: Mapped[str] = mapped_column(String(8))
    color: Mapped[str] = mapped_column(String(9), default="#E8A33D")

    players: Mapped[list["Player"]] = relationship(back_populates="team")


class Player(Base, TimestampMixin):
    __tablename__ = "players"
    __table_args__ = (UniqueConstraint("team_id", "number", name="uq_player_team_number"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(80))
    position: Mapped[str] = mapped_column(String(4))  # GK, DF, MF, FW
    number: Mapped[int] = mapped_column(Integer)

    team: Mapped[Team] = relationship(back_populates="players")


class Match(Base, TimestampMixin):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    home_team_id: Mapped[str] = mapped_column(ForeignKey("teams.id"))
    away_team_id: Mapped[str] = mapped_column(ForeignKey("teams.id"))
    seed: Mapped[int] = mapped_column(Integer)
    scenario: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(16), default="scheduled")  # scheduled|live|finished
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
