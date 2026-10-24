import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SimBadge } from "@/components/ui/SimBadge";
import { getCurrentLive, getLivePlayers } from "@/features/match/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayersPage() {
  const [current, data] = await Promise.all([
    getCurrentLive(),
    getLivePlayers().catch(() => null),
  ]);

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Players</h1>
        <p className="mt-1 text-sm text-text-muted">Start a match to see player data.</p>
      </div>
    );
  }

  const sorted = [...data.players].sort((a, b) => b.stats.involvement_score - a.stats.involvement_score);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Players</p>
          {current.live && <Badge tone="danger">Live · {current.match.scenario.replace(/_/g, " ")}</Badge>}
          <SimBadge />
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Player intelligence</h1>
        <p className="mt-1 text-sm text-text-muted">
          Aggregated from {data.match.match_id}.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((p) => (
          <Card key={p.player_id} className="flex flex-col">
            <CardHeader>
              <span className="truncate text-sm font-medium">{p.name}</span>
              <Badge tone="accent">{p.stats.involvement_score.toFixed(1)}</Badge>
            </CardHeader>
            <CardBody className="flex flex-1 flex-col gap-2">
              <div className="text-xs text-text-muted">
                {p.team_name} · #{p.number} · {p.position} · {p.stats.goals}G
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-text-faint">Prog passes</span>
                <span className="text-right font-mono">{p.stats.progressive_passes}</span>
                <span className="text-text-faint">Shots</span>
                <span className="text-right font-mono">{p.stats.shots}</span>
                <span className="text-text-faint">Def actions</span>
                <span className="text-right font-mono">{p.stats.defensive_actions}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
