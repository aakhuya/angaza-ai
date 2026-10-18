import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatGrid } from "@/components/match/StatGrid";
import { SCENARIOS } from "@/features/matches/scenarios";
import { getSnapshot, getTeams } from "@/features/match/server";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const p = await params;
  const meta = SCENARIOS.find((s) => s.id === p.scenario);
  if (!meta) notFound();

  let snap, teams;
  try {
    [snap, teams] = await Promise.all([
      getSnapshot(meta.id, 42),
      getTeams(meta.id),
    ]);
  } catch {
    return (
      <ErrorState
        title="Analysis unavailable"
        description="Could not load analysis for this scenario. Is the API running?"
      />
    );
  }

  const state = snap.state;
  const nameById = new Map<string, string>();
  for (const tp of [...teams.home.players, ...teams.away.players]) {
    nameById.set(tp.id, tp.name);
  }
  const topPlayers = Object.values(state.players ?? {})
    .sort((a, b) => b.involvement_score - a.involvement_score)
    .slice(0, 8)
    .filter((p) => p.involvement_score > 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Analysis</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight capitalize sm:text-3xl">
            {meta.label} · full time
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Deterministic state from seed {snap.seed}. Numbers come from analytics; explanations come from agents.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/matches/${meta.id}`}><Button variant="secondary">Live view</Button></Link>
          <Link href={`/matches/${meta.id}/recap`}><Button>Recap</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Final statistics</span>
          <Badge>{state.total_events} events</Badge>
        </CardHeader>
        <CardBody>
          <StatGrid state={state} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Standout players</span>
          <span className="font-mono text-2xs text-text-faint">ranked by involvement</span>
        </CardHeader>
        <CardBody>
          {topPlayers.length === 0 ? (
            <p className="text-sm text-text-muted">No player data for this scenario.</p>
          ) : (
            <ul className="divide-y divide-border">
              {topPlayers.map((p) => (
                <li key={p.player_id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/players/${encodeURIComponent(p.player_id)}?scenario=${meta.id}`}
                      className="text-sm font-medium hover:text-accent"
                    >
                      {nameById.get(p.player_id) ?? p.player_id}
                    </Link>
                    <div className="mt-0.5 font-mono text-2xs text-text-faint">
                      {p.team_id} · {p.goals}G · {p.shots}S · {p.progressive_passes}PP · {p.defensive_actions}DEF
                    </div>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-accent">
                    {p.involvement_score.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
