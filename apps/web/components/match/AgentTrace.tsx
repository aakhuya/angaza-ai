"use client";

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";

import type { AgentExecution } from "@/types/api";

export function AgentTrace({
  matchId,
  executions,
}: {
  matchId: string;
  executions: AgentExecution[];
}) {
  const recent = executions.slice(-4).reverse();

  return (
    <div className="rounded-lg border border-border bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Activity size={14} strokeWidth={1.75} className="text-accent" />
          <span className="text-sm font-medium">Agent trace</span>
        </div>
        <Link
          href={`/agents?match_id=${encodeURIComponent(matchId)}`}
          className="flex items-center gap-1 text-2xs text-text-muted hover:text-text"
        >
          Full trace <ArrowRight size={11} strokeWidth={1.75} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="px-4 py-6 text-xs text-text-muted">
          Waiting for the first important event. The pipeline fires within the
          first few minutes of match time.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={[
                  "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                  e.status === "ok" ? "bg-success" : e.status === "rejected" ? "bg-danger" : "bg-text-faint",
                ].join(" ")}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium capitalize">
                  {e.agent.replace(/_/g, " ")}
                </div>
                <div className="font-mono text-[0.62rem] text-text-faint">
                  {e.status} · {e.duration_ms}ms · {e.provider ?? "—"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
