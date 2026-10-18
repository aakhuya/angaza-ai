import { api } from "@/lib/api";
import type { AgentExecution } from "@/types/api";

export type AgentStats = {
  match_id: string;
  total: number;
  avg_duration_ms: number;
  by_agent: Record<string, number>;
  by_status: Record<string, number>;
  providers: Record<string, number>;
  rejection_rate: number;
};

export function getExecutions(matchId: string, limit = 200) {
  return api.get<{ match_id: string; count: number; executions: AgentExecution[] }>(
    `/agents/executions?match_id=${encodeURIComponent(matchId)}&limit=${limit}`,
  );
}

export function getAgentStats(matchId: string) {
  return api.get<AgentStats>(`/agents/stats?match_id=${encodeURIComponent(matchId)}`);
}
