import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAgentStats, getExecutions } from "@/features/agents/client";
import { getCurrentLive } from "@/features/match/live";
import type { AgentExecution } from "@/types/api";

const CHAIN_ORDER = ["tactical", "match_intelligence", "narrative", "personalization"] as const;
const STAGE_LABEL: Record<string, string> = {
  tactical: "Tactical Analysis",
  match_intelligence: "Match Intelligence",
  narrative: "Narrative",
  personalization: "Personalization",
};
const STAGE_DESCRIPTION: Record<string, string> = {
  tactical: "Identifies the pattern in play",
  match_intelligence: "Explains why the moment matters",
  narrative: "Writes broadcast-style copy",
  personalization: "Adapts tone to viewer mode",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ match_id?: string }>;
}) {
  const params = await searchParams;
  const current = await getCurrentLive();
  const matchId = params.match_id ?? current.match.match_id;

  const [executionsRes, statsRes] = await Promise.all([
    getExecutions(matchId, 300).catch(() => ({ match_id: matchId, count: 0, executions: [] as AgentExecution[] })),
    getAgentStats(matchId).catch(() => null),
  ]);

  const executions = executionsRes.executions;
  const stats = statsRes;

  const rejections = executions.filter((e) => e.status === "rejected");
  const lastEventId = findLastEventId(executions);
  const chain = lastEventId ? executionsForEvent(executions, lastEventId) : [];

  return (
    <div className="space-y-8 lg:space-y-10">
      <header>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
          Agent transparency
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Execution trace
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Every agent run recorded by the backend. Nothing here is mocked.
          Match ID: <span className="font-mono text-text">{matchId}</span>
        </p>
      </header>

      {/* Metrics strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total runs"
          value={stats?.total ?? executions.length}
          hint="In this match session"
        />
        <MetricCard
          label="Avg latency"
          value={stats ? `${stats.avg_duration_ms} ms` : "—"}
          hint="Per agent call"
        />
        <MetricCard
          label="Rejection rate"
          value={stats ? `${(stats.rejection_rate * 100).toFixed(1)}%` : "—"}
          hint="Verification failures"
          tone={(stats?.rejection_rate ?? 0) > 0.2 ? "danger" : undefined}
        />
        <MetricCard
          label="Providers"
          value={
            stats && Object.keys(stats.providers).length > 0
              ? Object.keys(stats.providers).join(", ")
              : "—"
          }
          hint="Active inference providers"
        />
      </div>

      {/* Chain of the last important event */}
      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Last pipeline run</span>
          {lastEventId && (
            <span className="font-mono text-2xs text-text-faint">
              event {lastEventId}
            </span>
          )}
        </CardHeader>
        <CardBody>
          {chain.length === 0 ? (
            <div className="space-y-3">
              <EmptyState
                title="No agent runs yet"
                description="Agent executions are recorded when a live match triggers an important event. Start one of the scenarios below."
              />
              <div className="flex flex-wrap gap-2">
                {["balanced", "high_press", "dominant_possession", "counter_attack", "late_comeback"].map((s) => (
                  <Link
                    key={s}
                    href={`/matches/${s}`}
                    className="rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text focus-ring"
                  >
                    Start {s.replace("_", " ")} →
                  </Link>
                ))}
              </div>
              <p className="text-xs text-text-faint">
                Wait 15–20 seconds after starting a match. The first
                important event will fire the pipeline, and executions
                will appear here automatically on your next reload.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {CHAIN_ORDER.map((agent, i) => {
                const run = chain.find((e) => e.agent === agent);
                const status = run?.status ?? "missing";
                return (
                  <li key={agent} className="relative pl-10">
                    <StepMarker index={i} status={status} />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{STAGE_LABEL[agent]}</span>
                      {run ? (
                        <>
                          <Badge tone={run.status === "ok" ? "teal" : "danger"}>
                            {run.status}
                          </Badge>
                          <span className="font-mono text-2xs text-text-faint">
                            {run.duration_ms} ms
                          </span>
                          {run.provider && (
                            <span className="font-mono text-2xs text-text-faint">
                              {run.provider}/{run.model ?? "—"}
                            </span>
                          )}
                        </>
                      ) : (
                        <Badge>not run</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {STAGE_DESCRIPTION[agent]}
                    </p>
                    {run?.reasons && run.reasons.length > 0 && (
                      <p className="mt-1 font-mono text-2xs text-danger">
                        {run.reasons.join("; ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </CardBody>
      </Card>

      {/* Verification rejections */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rejection log</span>
            <Badge tone={rejections.length > 0 ? "danger" : "neutral"}>
              {rejections.length}
            </Badge>
          </div>
          <span className="text-2xs text-text-faint">
            Insights blocked by verification
          </span>
        </CardHeader>
        <CardBody>
          {rejections.length === 0 ? (
            <p className="text-sm text-text-muted">
              No rejections recorded for this match. Every published insight
              passed the verification layer.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {rejections.slice(0, 20).map((e) => (
                <li key={e.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="danger">{e.agent}</Badge>
                    <span className="font-mono text-2xs text-text-faint">
                      {e.event_id}
                    </span>
                    <span className="ml-auto font-mono text-2xs text-text-faint">
                      {e.duration_ms} ms
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-2xs text-danger">
                    {e.reasons.join("; ")}
                  </p>
                  {Object.keys(e.output_summary).length > 0 && (
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {JSON.stringify(e.output_summary)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Full execution log */}
      <Card>
        <CardHeader>
          <span className="text-sm font-medium">All executions</span>
          <span className="font-mono text-2xs text-text-faint">
            {executions.length} rows
          </span>
        </CardHeader>
        <CardBody>
          {executions.length === 0 ? (
            <EmptyState
              title="No agent activity yet"
              description="Start a match to populate this log."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-2xs uppercase tracking-wider text-text-faint">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Agent</th>
                    <th className="py-2 pr-4 font-medium">Event</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium text-right">Duration</th>
                    <th className="py-2 pr-4 font-medium">Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {executions.slice(-30).reverse().map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 pr-4 font-medium">{e.agent}</td>
                      <td className="py-2 pr-4 font-mono text-text-faint">{e.event_id}</td>
                      <td className="py-2 pr-4">
                        <Badge tone={e.status === "ok" ? "teal" : e.status === "rejected" ? "danger" : "neutral"}>
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-right font-mono">{e.duration_ms} ms</td>
                      <td className="py-2 pr-4 font-mono text-text-faint">
                        {e.provider ? `${e.provider}/${e.model ?? "—"}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <p className="text-xs text-text-faint">
        <Link href="/matches/balanced" className="text-accent hover:underline">
          Open a live match →
        </Link>{" "}
        to generate fresh executions.
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-4">
      <div className="text-2xs uppercase tracking-wider text-text-faint">{label}</div>
      <div
        className={[
          "mt-2 font-mono text-2xl tabular-nums",
          tone === "danger" ? "text-danger" : "text-text",
        ].join(" ")}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-2xs text-text-muted">{hint}</div>}
    </div>
  );
}

function StepMarker({ index, status }: { index: number; status: string }) {
  const color =
    status === "ok"
      ? "bg-success border-success"
      : status === "rejected"
        ? "bg-danger border-danger"
        : status === "error"
          ? "bg-danger border-danger"
          : "bg-bg-elevated border-border";
  return (
    <span
      aria-hidden
      className={[
        "absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-2xs",
        color,
      ].join(" ")}
    >
      {index + 1}
    </span>
  );
}

function findLastEventId(executions: AgentExecution[]): string | null {
  for (let i = executions.length - 1; i >= 0; i -= 1) {
    if (executions[i].event_id) return executions[i].event_id;
  }
  return null;
}

function executionsForEvent(executions: AgentExecution[], eventId: string): AgentExecution[] {
  return executions.filter((e) => e.event_id === eventId);
}
