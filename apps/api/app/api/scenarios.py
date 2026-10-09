from fastapi import APIRouter, HTTPException, Query

from app.analytics.compute import compute_state
from app.services.insight_store import insight_store
from app.services.recap import build_recap
from app.simulation.engine import SimulationEngine
from app.simulation.roster import default_teams
from app.simulation.scenarios import SCENARIOS

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


def _validate(scenario: str) -> None:
    if scenario not in SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Unknown scenario: {scenario}")


@router.get("/{scenario}/snapshot")
def snapshot(scenario: str, seed: int = Query(42)) -> dict:
    _validate(scenario)
    match_id = f"{scenario}-{seed}"
    events = SimulationEngine(match_id, seed=seed, scenario=scenario).generate()
    state = compute_state(match_id, events)
    return {"scenario": scenario, "seed": seed, "state": state.model_dump()}


@router.get("/{scenario}/recap")
def recap(scenario: str, seed: int = Query(42)) -> dict:
    _validate(scenario)
    match_id = f"{scenario}-{seed}"
    events = SimulationEngine(match_id, seed=seed, scenario=scenario).generate()
    state = compute_state(match_id, events)
    insights = insight_store.list(match_id)
    return {"scenario": scenario, "seed": seed, "recap": build_recap(state, insights)}


@router.get("/{scenario}/teams")
def teams(scenario: str) -> dict:
    _validate(scenario)
    home, away = default_teams()
    return {
        "scenario": scenario,
        "home": {"id": home.id, "name": home.name, "short_name": home.short_name,
                 "players": [p.__dict__ for p in home.players]},
        "away": {"id": away.id, "name": away.name, "short_name": away.short_name,
                 "players": [p.__dict__ for p in away.players]},
    }


@router.get("/{scenario}/players/{player_id}")
def player(scenario: str, player_id: str, seed: int = Query(42)) -> dict:
    _validate(scenario)
    match_id = f"{scenario}-{seed}"
    events = SimulationEngine(match_id, seed=seed, scenario=scenario).generate()
    state = compute_state(match_id, events)

    # Allow lookup by either canonical player_id or player name.
    stats = state.players.get(player_id)
    roster_player = None
    home, away = default_teams()
    for team in (home, away):
        for p in team.players:
            if p.id == player_id or p.name == player_id:
                roster_player = {"id": p.id, "name": p.name, "position": p.position,
                                 "number": p.number, "team_id": team.id,
                                 "team_name": team.name}
                stats = state.players.get(p.id)
                break
        if roster_player:
            break

    if roster_player is None:
        raise HTTPException(status_code=404, detail="Player not found")

    return {
        "scenario": scenario,
        "seed": seed,
        "player": roster_player,
        "stats": stats.model_dump() if stats else None,
    }
