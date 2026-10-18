import { serverApi } from "@/lib/api-server";

const DEFAULT_MATCH_ID = "balanced-42-analyst";

export type CurrentMatchInfo = {
  matchId: string;
  scenario: string;
  seed: number;
  viewerMode: string;
  live: boolean;
};

/**
 * What should the app consider "the match in context" right now?
 *
 * Preference order:
 *  1. Any match the backend reports as currently running.
 *  2. The default deterministic replay (balanced, seed 42).
 *
 * The match_id format is `<scenario>-<seed>-<viewerMode>`, so we can split it
 * back into its parts.
 */
export async function getCurrentMatch(): Promise<CurrentMatchInfo> {
  try {
    const status = await serverApi.get<{ count: number; match_ids: string[] }>("/live/status");
    if (status.count > 0 && status.match_ids.length > 0) {
      const [scenario, seed, viewerMode] = parseMatchId(status.match_ids[0]);
      return { matchId: status.match_ids[0], scenario, seed, viewerMode, live: true };
    }
  } catch {
    // fall through to default
  }
  const [scenario, seed, viewerMode] = parseMatchId(DEFAULT_MATCH_ID);
  return { matchId: DEFAULT_MATCH_ID, scenario, seed, viewerMode, live: false };
}

function parseMatchId(id: string): [string, number, string] {
  const parts = id.split("-");
  // Scenario can contain underscores but never hyphens, so parts[0] is safe.
  const scenario = parts[0] ?? "balanced";
  const seed = Number(parts[1] ?? "42") || 42;
  const viewerMode = parts[2] ?? "analyst";
  return [scenario, seed, viewerMode];
}
