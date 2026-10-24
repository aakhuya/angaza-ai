"""
Shared pytest setup.

Creates a fresh SQLite database for the test session and creates the schema
for every model registered on Base.metadata — including models added after
the test was originally written. This is what makes the live-matches table
available to the runner integration test without special-casing.
"""
import tempfile
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@pytest.fixture(scope="session", autouse=True)
def _test_database(tmp_path_factory):
    """Point the app at a file-backed SQLite DB for the whole test session."""
    db_path = tmp_path_factory.mktemp("angaza-db") / "test.db"

    import os
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    os.environ.setdefault("JWT_SECRET", "test-secret")
    os.environ.setdefault("APP_SECRET_KEY", "test-secret")
    os.environ.setdefault("AI_PROVIDER", "mock")
    os.environ.setdefault("APP_ENV", "development")

    from app.core.config import get_settings
    get_settings.cache_clear()

    # Rebuild the session module against the test database.
    from app.models import session as session_mod
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        future=True,
    )
    session_mod.engine = engine
    session_mod.SessionLocal = sessionmaker(
        bind=engine, autoflush=False, autocommit=False, expire_on_commit=False
    )

    # Import every model module so their tables register on Base.metadata.
    from app.models import entities, live, user  # noqa: F401
    from app.models.base import Base

    Base.metadata.create_all(engine)

    yield db_path

    engine.dispose()
