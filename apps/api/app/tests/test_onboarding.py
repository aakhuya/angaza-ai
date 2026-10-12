from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_onboarding_requires_auth():
    assert client.get("/onboarding").status_code == 401
    assert client.post("/onboarding", json={
        "favorite_teams": [], "favorite_players": [],
        "viewer_mode": "analyst",
    }).status_code == 401
