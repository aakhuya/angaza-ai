from app.simulation.engine import SimulationEngine


def _serialize(events):
    return [e.model_dump(mode="json") for e in events]


def test_same_seed_same_stream():
    a = SimulationEngine("m1", seed=42, scenario="balanced").generate()
    b = SimulationEngine("m1", seed=42, scenario="balanced").generate()
    assert _serialize(a) == _serialize(b)
    assert len(a) > 100


def test_different_seed_differs():
    a = SimulationEngine("m1", seed=1, scenario="balanced").generate()
    b = SimulationEngine("m1", seed=2, scenario="balanced").generate()
    assert _serialize(a) != _serialize(b)


def test_scenarios_produce_distinct_streams():
    scenario_names = [
        "balanced",
        "high_press",
        "dominant_possession",
        "counter_attack",
        "late_comeback",
    ]
    streams = {
        name: _serialize(SimulationEngine("m1", seed=7, scenario=name).generate())
        for name in scenario_names
    }
    for a_name, a in streams.items():
        for b_name, b in streams.items():
            if a_name < b_name:
                assert a != b, f"{a_name} and {b_name} should differ"
