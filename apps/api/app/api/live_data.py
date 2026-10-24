"""Live data endpoints.

Each of these replays the same deterministic simulation as the running
match, using the same (match_id, seed, scenario). Because the simulator is
deterministic, the returned state and insights match what the live SSE
stream is producing — without needing shared in-memory state.
"""

from fastapi import APIRouter, HTTPException, Query

from app.analytics.compute import compute_state, score_importance
from app.services import live_tracker
from app.services.recap import build_recap
from app.simulation.engine import SimulationEngine
from app.simulation.roster import default_teams
from app.simulation.scenarios import SCENARIOS

router = APIRouter(prefix="/live-data", tags=["live-data"])


def _name_map() -> dict[str, dict]:
    """Map player_id -> {name, team_name, position, number}."""
    home, away = default_teams()
    out: dict[str, dict] = {}
    for team, name in ((home, home.name), (away, away.name)):
        for p in team.players:
            out[p.id] = {
                "name": p.name,
                "team_name": name,
                "position": p.position,
                "number": p.number,
            }
    return out


def _resolve_live(match_id: str | None, scenario: str | None, seed: int | None):
    """Find the running match or fall back to the provided/default values."""
    if match_id:
        for row in live_tracker.list_live():
            if row["match_id"] == match_id:
                return row
    running = live_tracker.list_live()
    if running:
        return running[0]
    s = scenario or "balanced"
    if s not in SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Unknown scenario: {s}")
    return {
        "match_id": f"{s}-{seed or 42}-analyst",
        "scenario": s,
        "seed": seed or 42,
        "viewer_mode": "analyst",
    }


@router.get("/current")
def current() -> dict:
    """Return the match every tab should currently be showing."""
    running = live_tracker.list_live()
    if running:
        return {"live": True, "match": running[0]}
    return {
        "live": False,
        "match": {
            "match_id": "balanced-42-analyst",
            "scenario": "balanced",
            "seed": 42,
            "viewer_mode": "analyst",
        },
    }


@router.get("/snapshot")
def snapshot(
    match_id: str | None = Query(None),
    scenario: str | None = Query(None),
    seed: int | None = Query(None),
) -> dict:
    row = _resolve_live(match_id, scenario, seed)
    events = SimulationEngine(
        row["match_id"], seed=row["seed"], scenario=row["scenario"]
    ).generate()
    state = compute_state(row["match_id"], events)

    # Collect insights the same way the live runner does.
    running = []
    insights = []
    for ev in events:
        running.append(ev)
        s = compute_state(row["match_id"], running)
        imp = score_importance(ev, s)
        if imp.score >= 0.30:
            insights.append(
                {"event": ev, "state": s, "importance": imp}
            )

    return {
        "match": row,
        "state": state.model_dump(),
        "insight_count": len(insights),
        "top_insights": [
            {
                "minute": i["event"].minute,
                "second": i["event"].second,
                "event_type": i["event"].event_type,
                "team_id": i["event"].team_id,
                "importance": i["importance"].score,
                "reasons": i["importance"].reasons,
            }
            for i in sorted(insights, key=lambda x: -x["importance"].score)[:8]
        ],
    }


@router.get("/recap")
def recap(
    match_id: str | None = Query(None),
    scenario: str | None = Query(None),
    seed: int | None = Query(None),
) -> dict:
    row = _resolve_live(match_id, scenario, seed)
    events = SimulationEngine(
        row["match_id"], seed=row["seed"], scenario=row["scenario"]
    ).generate()
    state = compute_state(row["match_id"], events)
    recap = build_recap(state, [])
    names = _name_map()
    for p in recap.get("standout_players", []):
        info = names.get(p["player_id"]) or {}
        p["name"] = info.get("name", p["player_id"])
        p["team_name"] = info.get("team_name", p["team_id"])
        p["position"] = info.get("position", "")
        p["number"] = info.get("number", 0)
    return {"match": row, "recap": recap}


@router.get("/teams")
def teams() -> dict:
    home, away = default_teams()
    return {
        "home": {"id": home.id, "name": home.name, "short_name": home.short_name,
                 "monogram": home.monogram,
                 "players": [p.__dict__ for p in home.players]},
        "away": {"id": away.id, "name": away.name, "short_name": away.short_name,
                 "monogram": away.monogram,
                 "players": [p.__dict__ for p in away.players]},
    }


@router.get("/players")
def players() -> dict:
    """Every player in the current simulation with their aggregated stats."""
    row = _resolve_live(None, None, None)
    events = SimulationEngine(
        row["match_id"], seed=row["seed"], scenario=row["scenario"]
    ).generate()
    state = compute_state(row["match_id"], events)
    home, away = default_teams()
    roster = {p.id: p for p in (*home.players, *away.players)}
    out = []
    for player_id, stats in state.players.items():
        p = roster.get(player_id)
        if p is None:
            continue
        out.append({
            "player_id": player_id,
            "name": p.name,
            "position": p.position,
            "number": p.number,
            "team_id": stats.team_id,
            "team_name": home.name if stats.team_id == home.id else away.name,
            "stats": stats.model_dump(),
        })
    return {"match": row, "players": out}
