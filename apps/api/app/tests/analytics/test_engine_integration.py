from app.analytics.compute import compute_state
from app.simulation.engine import SimulationEngine


def test_full_match_produces_coherent_state():
    events = SimulationEngine("m1", seed=42, scenario="balanced").generate()
    state = compute_state("m1", events)

    assert state.total_events == len(events)
    assert 0 <= state.home.possession_pct <= 100
    assert 0 <= state.away.possession_pct <= 100
    assert abs(state.home.possession_pct + state.away.possession_pct - 100) < 0.5
    assert state.home.passes_attempted > 0
    assert state.away.passes_attempted > 0
    assert 0 <= state.home.pass_accuracy <= 100
    assert state.home.shots >= state.home.goals
    assert state.away.shots >= state.away.goals
    assert len(state.momentum) > 0
    assert state.players  # non-empty


def test_dominant_possession_scenario_yields_possession_edge():
    events = SimulationEngine("m1", seed=11, scenario="dominant_possession").generate()
    state = compute_state("m1", events)
    assert state.home.possession_pct > state.away.possession_pct
