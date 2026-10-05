from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "env" in body and "ai_provider" in body
