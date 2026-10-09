import { api } from "@/lib/api";
import type { AgentExecution } from "@/types/api";

export function getExecutions(matchId: string, limit = 200) {
  return api.get<{ match_id: string; count: number; executions: AgentExecution[] }>(
    `/agents/executions?match_id=${encodeURIComponent(matchId)}&limit=${limit}`,
  );
}
