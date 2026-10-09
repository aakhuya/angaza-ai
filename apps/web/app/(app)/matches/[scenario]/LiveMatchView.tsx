"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/ui/ErrorState";
import { InsightFeed } from "@/components/match/InsightFeed";
import { KeyMoment } from "@/components/match/KeyMoment";
import { MatchHeader } from "@/components/match/MatchHeader";
import { MomentumChart } from "@/components/match/MomentumChart";
import { StatGrid } from "@/components/match/StatGrid";
import { ViewerModeSwitcher } from "@/components/match/ViewerModeSwitcher";
import { useMatchStream } from "@/features/match/useMatchStream";
import type { Scenario, ViewerMode } from "@/types/api";

export function LiveMatchView({
  scenario, initialViewerMode, seed,
}: { scenario: Scenario; initialViewerMode: ViewerMode; seed: number }) {
  const [viewerMode, setViewerMode] = useState<ViewerMode>(initialViewerMode);
  const matchId = useMemo(() => `${scenario}-${seed}-${viewerMode}`, [scenario, seed, viewerMode]);

  const { state, insights, status, error } = useMatchStream(matchId, {
    scenario, seed, viewerMode, autoStart: true,
  });

  const keyMoment = insights.length > 0 ? insights[insights.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Live match</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight capitalize">
            {scenario.replace("_", " ")}
          </h1>
        </div>
        <ViewerModeSwitcher value={viewerMode} onChange={setViewerMode} />
      </div>

      {error && <ErrorState title="Stream error" description={error} />}

      <MatchHeader
        homeName={state?.home.team_id ?? "HOME"}
        awayName={state?.away.team_id ?? "AWAY"}
        homeScore={state?.home_score ?? 0}
        awayScore={state?.away_score ?? 0}
        minute={state?.minute ?? 0}
        second={state?.second ?? 0}
        status={status}
      />

      {keyMoment && <KeyMoment insight={keyMoment} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Intelligence feed</h2>
            <span className="font-mono text-2xs text-text-faint">{insights.length}</span>
          </div>
          <InsightFeed insights={insights} />
        </div>
      </div>
    </div>
  );
}
