export type ViewerMode = "casual" | "analyst" | "player_focus";

export type User = { id: string; email: string; display_name: string };

export type Profile = {
  display_name: string;
  favorite_team: string;
  favorite_player: string;
};

export type Preferences = {
  viewer_mode: ViewerMode;
  language: string;
  explanation_detail: "brief" | "standard" | "deep";
};

export type TeamStats = {
  team_id: string;
  possession_pct: number;
  passes_attempted: number;
  passes_completed: number;
  pass_accuracy: number;
  progressive_passes: number;
  final_third_entries: number;
  shots: number;
  shots_on_target: number;
  goals: number;
  tackles_won: number;
  interceptions: number;
  pressures: number;
  possession_recoveries: number;
};

export type PlayerStats = {
  player_id: string;
  team_id: string;
  passes_completed: number;
  progressive_passes: number;
  shots: number;
  goals: number;
  defensive_actions: number;
  distance_covered_m: number;
  involvement_score: number;
};

export type MomentumPoint = { minute: number; home: number; away: number };

export type MatchState = {
  match_id: string;
  minute: number;
  second: number;
  home_score: number;
  away_score: number;
  home: TeamStats;
  away: TeamStats;
  players: Record<string, PlayerStats>;
  momentum: MomentumPoint[];
  total_events: number;
};

export type Insight = {
  insight_id: string;
  match_id: string;
  minute: number;
  second: number;
  category: string;
  title: string;
  body: string;
  viewer_mode: ViewerMode;
  supporting_event_ids: string[];
  confidence: number;
};

export type AgentExecution = {
  id: string;
  match_id: string;
  event_id: string;
  agent: string;
  stage: string;
  status: "ok" | "rejected" | "error";
  duration_ms: number;
  provider: string | null;
  model: string | null;
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown>;
  reasons: string[];
  created_at: string;
};

export type Scenario = "balanced" | "high_press" | "dominant_possession" | "counter_attack" | "late_comeback";
