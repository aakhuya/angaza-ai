import type { Scenario } from "@/types/api";

export type ScenarioMeta = {
  id: Scenario;
  label: string;
  blurb: string;
};

export const SCENARIOS: ScenarioMeta[] = [
  { id: "balanced", label: "Balanced", blurb: "Even matchup. Both sides take turns controlling possession." },
  { id: "high_press", label: "High press", blurb: "Aggressive pressing triggers. Possession changes are frequent." },
  { id: "dominant_possession", label: "Dominant possession", blurb: "One side holds the ball and builds patiently." },
  { id: "counter_attack", label: "Counter-attack", blurb: "Deep blocks and fast transitions into space." },
  { id: "late_comeback", label: "Late comeback", blurb: "Game state swings after the 70th minute." },
];
