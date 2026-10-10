import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# A password that satisfies the policy: 8+ chars, 3 of 4 classes.
STRONG = "Correct-Horse1"


@pytest.fixture()
def client(monkeypatch):
    tmp = Path(tempfile.mkdtemp()) / "auth.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp}")
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("AI_PROVIDER", "mock")

    from app.core.config import get_settings
    get_settings.cache_clear()

    from app.models import session as session_mod
    engine = create_engine(
        f"sqlite:///{tmp}", connect_args={"check_same_thread": False}, future=True
    )
    session_mod.engine = engine
    session_mod.SessionLocal = sessionmaker(
        bind=engine, autoflush=False, autocommit=False, expire_on_commit=False
    )

    from app.models.base import Base
    from app.models import entities, user  # noqa: F401
    Base.metadata.create_all(engine)

    from app.api import deps

    def _get_db():
        db = session_mod.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    from app.main import create_app
    app = create_app()
    app.dependency_overrides[deps.get_db] = _get_db

    with TestClient(app) as c:
        yield c


def test_signup_login_logout_flow(client):
    r = client.post("/auth/signup", json={
        "email": "fan@example.com", "password": STRONG, "display_name": "Ada",
    })
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["email"] == "fan@example.com"
    assert body["display_name"] == "Ada"
    assert "angaza_access" in r.cookies
    assert "angaza_refresh" in r.cookies

    me = client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "fan@example.com"

    client.post("/auth/logout")
    me2 = client.get("/auth/me")
    assert me2.status_code == 401


def test_signup_rejects_weak_password(client):
    r = client.post("/auth/signup", json={
        "email": "weak@example.com", "password": "abc",
    })
    # Pydantic min_length trips first for "abc"; a mid-length weak password
    # trips the policy check. Both must not create an account.
    assert r.status_code in (422,)


def test_signup_rejects_midlength_weak_password(client):
    r = client.post("/auth/signup", json={
        "email": "weak2@example.com", "password": "abcdefgh",
    })
    assert r.status_code == 422
    assert "strength" in r.json()["detail"].lower()


def test_duplicate_signup_rejected(client):
    payload = {"email": "dup@example.com", "password": STRONG}
    assert client.post("/auth/signup", json=payload).status_code == 201
    assert client.post("/auth/signup", json=payload).status_code == 409


def test_login_wrong_password_rejected(client):
    client.post("/auth/signup", json={"email": "x@example.com", "password": STRONG})
    client.post("/auth/logout")
    r = client.post("/auth/login", json={"email": "x@example.com", "password": "Wrong-Pass9"})
    assert r.status_code == 401


def test_login_email_is_case_insensitive(client):
    client.post("/auth/signup", json={"email": "Case@Example.com", "password": STRONG})
    client.post("/auth/logout")
    r = client.post("/auth/login", json={"email": "case@example.com", "password": STRONG})
    assert r.status_code == 200


def test_preferences_and_profile_roundtrip(client):
    client.post("/auth/signup", json={"email": "p@example.com", "password": STRONG})

    r = client.patch("/profile", json={"favorite_team": "Angaza FC", "favorite_player": "HOME-p09"})
    assert r.status_code == 200
    assert r.json()["favorite_team"] == "Angaza FC"

    r = client.patch("/preferences", json={"viewer_mode": "player_focus"})
    assert r.status_code == 200
    assert r.json()["viewer_mode"] == "player_focus"

    assert client.get("/preferences").json()["viewer_mode"] == "player_focus"
    assert client.get("/profile").json()["favorite_player"] == "HOME-p09"


def test_preferences_validation(client):
    client.post("/auth/signup", json={"email": "v@example.com", "password": STRONG})
    r = client.patch("/preferences", json={"viewer_mode": "made_up"})
    assert r.status_code == 422


def test_protected_route_requires_auth(client):
    assert client.get("/profile").status_code == 401
    assert client.get("/preferences").status_code == 401


def test_refresh_rotates_and_old_token_invalid(client):
    client.post("/auth/signup", json={"email": "r@example.com", "password": STRONG})
    old_refresh = client.cookies.get("angaza_refresh")

    r = client.post("/auth/refresh")
    assert r.status_code == 200
    new_refresh = client.cookies.get("angaza_refresh")
    assert old_refresh != new_refresh

    client.cookies.set("angaza_refresh", old_refresh)
    r2 = client.post("/auth/refresh")
    assert r2.status_code == 401
