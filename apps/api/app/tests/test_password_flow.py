from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_password_check_endpoint_reports_rules():
    r = client.post("/auth/password/check", json={"password": "Abcd1234"})
    assert r.status_code == 200
    body = r.json()
    assert body["valid"] is True
    assert body["rules"]["length"] is True
    assert body["classes_met"] >= 3


def test_password_check_endpoint_rejects_weak():
    r = client.post("/auth/password/check", json={"password": "abc"})
    assert r.status_code == 200
    assert r.json()["valid"] is False


def test_forgot_password_returns_202_for_unknown_email():
    r = client.post("/auth/password/forgot", json={"email": "ghost@example.com"})
    assert r.status_code == 202


def test_reset_password_rejects_bad_token():
    r = client.post(
        "/auth/password/reset",
        json={"token": "not-a-real-token-string-x", "new_password": "Abcd1234!"},
    )
    assert r.status_code == 400


def test_oauth_unknown_provider_404():
    assert client.get("/auth/oauth/github/start").status_code == 404


def test_oauth_google_not_configured_returns_503():
    # No GOOGLE_CLIENT_ID in test env → expect a clear 503, not a fake redirect.
    assert client.get("/auth/oauth/google/start").status_code == 503
