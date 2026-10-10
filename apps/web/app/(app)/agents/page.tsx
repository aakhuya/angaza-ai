import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getExecutions } from "@/features/agents/server";

const STAGES = ["INGEST", "INTERPRET", "EXPLAIN", "VERIFY", "PERSONALIZE", "RENDER"];

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ match_id?: string }>;
}) {
  const { match_id } = await searchParams;
  const matchId = match_id ?? "balanced-42-analyst";

  let payload: Awaited<ReturnType<typeof getExecutions>> | null = null;
  try {
    payload = await getExecutions(matchId);
  } catch {
    payload = null;
  }

  const executions = payload?.executions ?? [];
  const counts = executions.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});
  const providers = Array.from(new Set(executions.map((e) => e.provider).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Agents</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Execution trace</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Every agent run recorded by the backend. This page reads real rows — nothing here is faked.
          Match ID: <span className="font-mono text-text">{matchId}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Runs</span>
            <Badge>{executions.length}</Badge>
          </CardHeader>
          <CardBody className="text-sm text-text-muted">
            {Object.entries(counts).map(([status, n]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="font-mono text-2xs uppercase tracking-wider text-text-faint">{status}</span>
                <span className="font-mono text-sm">{n}</span>
              </div>
            ))}
            {executions.length === 0 && <>No executions recorded yet.</>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Providers</span>
          </CardHeader>
          <CardBody className="font-mono text-sm text-text-muted">
            {providers.length === 0 ? "—" : providers.join(", ")}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Stages</span>
          </CardHeader>
          <CardBody className="font-mono text-2xs text-text-muted">
            {STAGES.join(" → ")}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Recent executions</span>
        </CardHeader>
        <CardBody>
          {executions.length === 0 ? (
            <EmptyState
              title="No agent activity yet"
              description="Start a match on the live page — executions will appear here as the pipeline runs."
            />
          ) : (
            <ul className="divide-y divide-border">
              {[...executions].reverse().map((e) => (
                <li key={e.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={e.status === "ok" ? "teal" : e.status === "rejected" ? "danger" : "neutral"}>
                      {e.status}
                    </Badge>
                    <span className="font-mono text-2xs text-text-faint">{e.agent}</span>
                    <span className="font-mono text-2xs text-text-faint">{e.duration_ms}ms</span>
                    {e.provider && (
                      <span className="font-mono text-2xs text-text-faint">
                        {e.provider}/{e.model}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-2xs text-text-faint">{e.event_id}</span>
                  </div>
                  {e.reasons.length > 0 && (
                    <p className="mt-1.5 font-mono text-2xs text-danger">
                      {e.reasons.join("; ")}
                    </p>
                  )}
                  {Object.keys(e.output_summary).length > 0 && (
                    <p className="mt-1.5 text-xs text-text-muted">
                      {JSON.stringify(e.output_summary)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
