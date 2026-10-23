from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def normalise_database_url(url: str) -> str:
    """Rewrite a Postgres URL to explicitly use psycopg3.

    SQLAlchemy 2.x defaults `postgresql://` and `postgres://` to the psycopg2
    driver, but we install psycopg3 (`psycopg[binary]`). Qualifying the scheme
    as `postgresql+psycopg://` forces SQLAlchemy to use the installed driver.
    """
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


_settings = get_settings()

_connect_args = (
    {"check_same_thread": False}
    if _settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(
    normalise_database_url(_settings.database_url),
    connect_args=_connect_args,
    future=True,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, expire_on_commit=False
)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
