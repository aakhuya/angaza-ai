from dataclasses import dataclass


@dataclass(frozen=True)
class Scenario:
    name: str
    home_pass_bias: float         # 0..1 → probability home completes a pass
    home_pressure: float          # 0..1 → likelihood home triggers pressure
    home_shot_rate: float         # relative shot frequency per possession
    away_pass_bias: float
    away_pressure: float
    away_shot_rate: float
    late_swing: bool = False      # if True, late-match probability shift toward trailing side


SCENARIOS: dict[str, Scenario] = {
    "balanced": Scenario(
        name="balanced",
        home_pass_bias=0.82, home_pressure=0.35, home_shot_rate=0.18,
        away_pass_bias=0.80, away_pressure=0.35, away_shot_rate=0.17,
    ),
    "high_press": Scenario(
        name="high_press",
        home_pass_bias=0.74, home_pressure=0.70, home_shot_rate=0.16,
        away_pass_bias=0.83, away_pressure=0.30, away_shot_rate=0.22,
    ),
    "dominant_possession": Scenario(
        name="dominant_possession",
        home_pass_bias=0.90, home_pressure=0.40, home_shot_rate=0.26,
        away_pass_bias=0.68, away_pressure=0.45, away_shot_rate=0.08,
    ),
    "counter_attack": Scenario(
        name="counter_attack",
        home_pass_bias=0.80, home_pressure=0.28, home_shot_rate=0.10,
        away_pass_bias=0.85, away_pressure=0.30, away_shot_rate=0.28,
    ),
    "late_comeback": Scenario(
        name="late_comeback",
        home_pass_bias=0.78, home_pressure=0.35, home_shot_rate=0.14,
        away_pass_bias=0.84, away_pressure=0.38, away_shot_rate=0.24,
        late_swing=True,
    ),
}


def get_scenario(name: str) -> Scenario:
    if name not in SCENARIOS:
        raise ValueError(f"Unknown scenario: {name}")
    return SCENARIOS[name]
