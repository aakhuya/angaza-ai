"use client";

import { PauseCircle, PlayCircle, RotateCcw } from "lucide-react";


import { useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/components/ui/ErrorState";
import { InsightFeed } from "@/components/match/InsightFeed";
import { KeyMoment } from "@/components/match/KeyMoment";
import { MatchHeader } from "@/components/match/MatchHeader";
import { MomentumChart } from "@/components/match/MomentumChart";
import { StatGrid } from "@/components/match/StatGrid";
import { ViewerModeSwitcher } from "@/components/match/ViewerModeSwitcher";
import { AgentTrace } from "@/components/match/AgentTrace";
import { useMatchStream } from "@/features/match/useMatchStream";
import type { Scenario, ViewerMode } from "@/types/api";

export function LiveMatchView({
  scenario, initialViewerMode, seed,
}: { scenario: Scenario; initialViewerMode: ViewerMode; seed: number }) {
  const [viewerMode, setViewerMode] = useState<ViewerMode>(initialViewerMode);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const matchId = useMemo(() => `${scenario}-${seed}-${viewerMode}`, [scenario, seed, viewerMode]);

  const { state, insights, status, error } = useMatchStream(matchId, {
    scenario, seed, viewerMode, autoStart: true,
  });

  const [executions, setExecutions] = useState<import("@/types/api").AgentExecution[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/agents/executions?match_id=${encodeURIComponent(matchId)}&limit=50`, { credentials: "include" });
        if (!res.ok || cancelled) return;
        const body = await res.json();
        if (!cancelled) setExecutions(body.executions ?? []);
      } catch {
        // Non-fatal; the trace stays at its previous state.
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, [matchId]);

  const keyMoment = insights.length > 0 ? insights[insights.length - 1] : null;

  async function togglePause() {
    setBusy(true);
    try {
      if (paused) {
        await fetch(`/api/matches/${encodeURIComponent(matchId)}/start?seed=${seed}&scenario=${scenario}&viewer_mode=${viewerMode}&speed=600`, {
          method: "POST",
          credentials: "include",
        });
      } else {
        await fetch(`/api/matches/${encodeURIComponent(matchId)}/stop`, {
          method: "POST",
          credentials: "include",
        });
      }
      setPaused(!paused);
    } finally {
      setBusy(false);
    }
  }

  async function restart() {
    setBusy(true);
    try {
      await fetch(`/api/matches/${encodeURIComponent(matchId)}/stop`, { method: "POST", credentials: "include" });
      await fetch(`/api/matches/${encodeURIComponent(matchId)}/start?seed=${seed}&scenario=${scenario}&viewer_mode=${viewerMode}&speed=600`, {
        method: "POST",
        credentials: "include",
      });
      setPaused(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Live match</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight capitalize">
            {scenario.replace("_", " ")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePause}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text disabled:opacity-50"
          >
            {paused ? <PlayCircle size={13} strokeWidth={1.75} /> : <PauseCircle size={13} strokeWidth={1.75} />}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={restart}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text disabled:opacity-50"
          >
            <RotateCcw size={13} strokeWidth={1.75} />
            Restart
          </button>
          <ViewerModeSwitcher value={viewerMode} onChange={setViewerMode} />
        </div>
      </div>

      {error && <ErrorState title="Stream error" description={error} />}

      <MatchHeader
        homeName={state?.home.team_id === "HOME" ? "Angaza FC" : (state?.home.team_id ?? "HOME")}
        awayName={state?.away.team_id === "AWAY" ? "Mwangaza United" : (state?.away.team_id ?? "AWAY")}
        homeMonogram="ANG"
        awayMonogram="MWU"
        homeScore={state?.home_score ?? 0}
        awayScore={state?.away_score ?? 0}
        minute={state?.minute ?? 0}
        second={state?.second ?? 0}
        status={status}
      />

      {keyMoment && <KeyMoment insight={keyMoment} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <div className="rounded-lg border border-border bg-bg-surface p-5">
            <h2 className="text-sm font-medium">Momentum</h2>
            <p className="mt-1 text-xs text-text-muted">
              5-minute buckets weighted by goals, shots, and final-third passes.
            </p>
            <div className="mt-4">
              {state ? (
                <MomentumChart
                  points={state.momentum}
                  homeLabel={state.home.team_id}
                  awayLabel={state.away.team_id}
                />
              ) : (
                <div className="text-sm text-text-muted">Waiting for events…</div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-surface p-5">
            <h2 className="text-sm font-medium">Statistics</h2>
            <div className="mt-4">
              {state ? <StatGrid state={state} /> : <div className="text-sm text-text-muted">Waiting for events…</div>}
            </div>
          </div>
        </div>

        <div className="order-1 space-y-4 lg:order-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Intelligence feed</h2>
            <span className="font-mono text-2xs text-text-faint">{insights.length}</span>
          </div>
          <InsightFeed insights={insights} />
          <AgentTrace matchId={matchId} executions={executions} />
        </div>
      </div>
    </div>
  );
}
