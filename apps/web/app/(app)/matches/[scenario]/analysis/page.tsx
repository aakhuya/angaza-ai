import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatGrid } from "@/components/match/StatGrid";
import { SCENARIOS } from "@/features/matches/scenarios";
import { getSnapshot } from "@/features/match/server";

export default async function AnalysisPage({
  params,
}: { params: { scenario: string } }) {
  const meta = SCENARIOS.find((s) => s.id === params.scenario);
  if (!meta) notFound();

  let snapshot;
  try {
    snapshot = await getSnapshot(meta.id, 42);
  } catch {
    return <ErrorState title="Analysis unavailable" description="Could not load analysis for this scenario." />;
  }

  const { state } = snapshot;
  const topPlayers = Object.values(state.players)
    .sort((a, b) => b.involvement_score - a.involvement_score)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Analysis</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight capitalize">
            {meta.label} · full time
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Deterministic state from seed {snapshot.seed}. Numbers come from analytics; explanations come from agents.
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
            <p className="text-sm text-text-muted">No player data.</p>
          ) : (
            <ul className="divide-y divide-border">
              {topPlayers.map((p) => (
                <li key={p.player_id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/players/${encodeURIComponent(p.player_id)}?scenario=${meta.id}`}
                      className="text-sm font-medium hover:text-accent"
                    >
                      {p.player_id}
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
