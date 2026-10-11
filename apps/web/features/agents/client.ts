import "server-only";

import { serverApi } from "@/lib/api-server";
import type { AgentExecution } from "@/types/api";

export type ExecutionsResponse = {
  match_id: string;
  count: number;
  executions: AgentExecution[];
};

export function getExecutions(matchId: string, limit = 200): Promise<ExecutionsResponse> {
  return serverApi.get<ExecutionsResponse>(
    `/agents/executions?match_id=${encodeURIComponent(matchId)}&limit=${limit}`,
  );
}
