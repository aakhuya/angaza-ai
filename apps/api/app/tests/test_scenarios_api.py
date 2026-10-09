from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_snapshot_ok_and_deterministic():
    a = client.get("/scenarios/balanced/snapshot?seed=42").json()
    b = client.get("/scenarios/balanced/snapshot?seed=42").json()
    assert a == b
    assert a["state"]["total_events"] > 0


def test_unknown_scenario_404():
    assert client.get("/scenarios/not_a_scenario/snapshot").status_code == 404


def test_teams_shape():
    body = client.get("/scenarios/balanced/teams").json()
    assert len(body["home"]["players"]) == 11
    assert len(body["away"]["players"]) == 11


def test_player_lookup_by_id_and_name():
    teams = client.get("/scenarios/high_press/teams").json()
    any_player = teams["home"]["players"][5]
    by_id = client.get(f"/scenarios/high_press/players/{any_player['id']}").json()
    assert by_id["player"]["id"] == any_player["id"]

    name_encoded = any_player["name"].replace(" ", "%20")
    by_name = client.get(
        f"/scenarios/high_press/players/{name_encoded}"
    ).json()
    assert by_name["player"]["id"] == any_player["id"]


def test_player_404():
    assert client.get("/scenarios/balanced/players/nobody").status_code == 404


def test_recap_contains_required_sections():
    body = client.get("/scenarios/counter_attack/recap?seed=7").json()["recap"]
    assert "final_score" in body
    assert "story" in body
    assert "tactical_story" in body
    assert isinstance(body["key_moments"], list)
    assert "statistics" in body
