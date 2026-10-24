import { serverApi } from "@/lib/api-server";
import type { MatchState } from "@/types/api";

export type LiveMatchMeta = {
  match_id: string;
  scenario: string;
  seed: number;
  viewer_mode: string;
};

export type LiveCurrent = { live: boolean; match: LiveMatchMeta };

export async function getCurrentLive(): Promise<LiveCurrent> {
  try {
    return await serverApi.get<LiveCurrent>("/live-data/current");
  } catch {
    return {
      live: false,
      match: { match_id: "balanced-42-analyst", scenario: "balanced", seed: 42, viewer_mode: "analyst" },
    };
  }
}

export type LiveSnapshot = {
  match: LiveMatchMeta;
  state: MatchState;
  insight_count: number;
  top_insights: Array<{
    minute: number;
    second: number;
    event_type: string;
    team_id: string;
    importance: number;
    reasons: string[];
  }>;
};

export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  return serverApi.get<LiveSnapshot>("/live-data/snapshot");
}

export type LiveRecap = {
  match: LiveMatchMeta;
  recap: {
    match_id: string;
    final_score: { home: number; away: number };
    story: string;
    tactical_story: string;
    key_moments: Array<{ minute: number; category: string; title: string; body: string; confidence: number }>;
    standout_players: Array<{
      player_id: string;
      name?: string;
      team_id: string;
      team_name?: string;
      position?: string;
      number?: number;
      involvement_score: number;
      goals: number;
      shots: number;
      progressive_passes: number;
      defensive_actions: number;
    }>;
    turning_point: { minute: number; title: string; body: string; category: string } | null;
    statistics: Record<string, [number, number]>;
  };
};

export async function getLiveRecap(): Promise<LiveRecap> {
  return serverApi.get<LiveRecap>("/live-data/recap");
}

export type LivePlayer = {
  player_id: string;
  name: string;
  position: string;
  number: number;
  team_id: string;
  team_name: string;
  stats: {
    passes_completed: number;
    progressive_passes: number;
    shots: number;
    goals: number;
    defensive_actions: number;
    distance_covered_m: number;
    involvement_score: number;
  };
};

export async function getLivePlayers(): Promise<{ match: LiveMatchMeta; players: LivePlayer[] }> {
  return serverApi.get("/live-data/players");
}
