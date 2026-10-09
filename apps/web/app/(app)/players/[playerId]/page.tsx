import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getPlayer } from "@/features/match/server";
import { SCENARIOS } from "@/features/matches/scenarios";

export default async function PlayerPage({
  params, searchParams,
}: {
  params: { playerId: string };
  searchParams: { scenario?: string };
}) {
  const scenario = SCENARIOS.find((s) => s.id === searchParams.scenario)?.id ?? "balanced";

  let detail;
  try {
    detail = await getPlayer(scenario, params.playerId, 42);
  } catch {
    return <ErrorState title="Player not found" description={`No record for “${params.playerId}”.`} />;
  }

  const { player, stats } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Player</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{player.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {player.team_name} · #{player.number} · {player.position}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/matches/${scenario}`}><Button variant="secondary">Live view</Button></Link>
          <Link href={`/matches/${scenario}/analysis`}><Button variant="secondary">Analysis</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Involvement — {scenario.replace("_", " ")}</span>
          {stats && <Badge tone="accent">{stats.involvement_score.toFixed(1)}</Badge>}
        </CardHeader>
        <CardBody>
          {!stats ? (
            <EmptyState
              title="No recorded involvement"
              description="This player did not register any actions in the selected match."
            />
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {[
                ["Goals", stats.goals],
                ["Shots", stats.shots],
                ["Passes completed", stats.passes_completed],
                ["Progressive passes", stats.progressive_passes],
                ["Defensive actions", stats.defensive_actions],
                ["Distance covered (m)", Math.round(stats.distance_covered_m)],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-2xs uppercase tracking-wider text-text-faint">{label}</dt>
                  <dd className="mt-0.5 font-mono text-sm text-text">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
