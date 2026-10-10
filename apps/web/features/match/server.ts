import { serverApi } from "@/lib/api-server";
import type { MatchState } from "@/types/api";

export type ScenarioSnapshot = { scenario: string; seed: number; state: MatchState };

export function getSnapshot(scenario: string, seed = 42) {
  return serverApi.get<ScenarioSnapshot>(`/scenarios/${scenario}/snapshot?seed=${seed}`);
}

export type Recap = {
  match_id: string;
  final_score: { home: number; away: number };
  story: string;
  tactical_story: string;
  key_moments: Array<{
    minute: number;
    category: string;
    title: string;
    body: string;
    confidence: number;
  }>;
  standout_players: Array<{
    player_id: string;
    team_id: string;
    involvement_score: number;
    goals: number;
    shots: number;
    progressive_passes: number;
    defensive_actions: number;
  }>;
  turning_point: { minute: number; title: string; body: string; category: string } | null;
  statistics: Record<string, [number, number]>;
};

export function getRecap(scenario: string, seed = 42) {
  return serverApi.get<{ scenario: string; seed: number; recap: Recap }>(
    `/scenarios/${scenario}/recap?seed=${seed}`,
  );
}

export type PlayerDetail = {
  scenario: string;
  seed: number;
  player: {
    id: string;
    name: string;
    position: string;
    number: number;
    team_id: string;
    team_name: string;
  };
  stats: null | {
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
};

export function getPlayer(scenario: string, playerId: string, seed = 42) {
  return serverApi.get<PlayerDetail>(
    `/scenarios/${scenario}/players/${encodeURIComponent(playerId)}?seed=${seed}`,
  );
}
