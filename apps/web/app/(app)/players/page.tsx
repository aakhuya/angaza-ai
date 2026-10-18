import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SCENARIOS } from "@/features/matches/scenarios";
import { getSnapshot } from "@/features/match/server";
import { getCurrentMatch } from "@/lib/currentMatch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayersIndexPage() {
  const current = await getCurrentMatch();

  const results = await Promise.allSettled(
    SCENARIOS.map(async (s) => ({ scenario: s, snapshot: await getSnapshot(s.id, current.seed) })),
  );

  type TopRow = {
    playerId: string;
    playerLabel: string;
    scenarioId: string;
    teamId: string;
    involvement: number;
    goals: number;
  };
  const aggregated = new Map<string, TopRow>();

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { scenario, snapshot } = r.value;
    for (const p of Object.values(snapshot.state.players)) {
      if (p.involvement_score <= 0) continue;
      const existing = aggregated.get(p.player_id);
      if (!existing || p.involvement_score > existing.involvement) {
        aggregated.set(p.player_id, {
          playerId: p.player_id,
          playerLabel: humanise(p.player_id),
          scenarioId: scenario.id,
          teamId: p.team_id,
          involvement: p.involvement_score,
          goals: p.goals,
        });
      }
    }
  }

  const rows = Array.from(aggregated.values())
    .sort((a, b) => b.involvement - a.involvement)
    .slice(0, 12);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Players</p>
          {current.live && <Badge tone="danger">Following live · {current.scenario.replace(/_/g, " ")}</Badge>}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Player intelligence</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Top contributors across scenarios, ranked by involvement.
        </p>
      </header>

      {rows.length === 0 ? (
        <Card><CardBody><p className="text-sm text-text-muted">No player data available yet.</p></CardBody></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.playerId} className="flex flex-col">
              <CardHeader>
                <span className="truncate text-sm font-medium">{r.playerLabel}</span>
                <Badge tone="accent">{r.involvement.toFixed(1)}</Badge>
              </CardHeader>
              <CardBody className="flex flex-1 flex-col gap-2">
                <div className="text-xs text-text-muted">{r.teamId === "HOME" ? "Angaza FC" : "Mwangaza United"} · {r.goals}G</div>
                <Link
                  href={`/players/${encodeURIComponent(r.playerId)}?scenario=${r.scenarioId}&seed=${current.seed}`}
                  className="mt-auto pt-2 text-xs font-medium text-accent hover:underline"
                >
                  View profile →
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Turn a player id like "HOME-p06" into a readable label.
 *
 * The API exposes per-scenario team rosters with real names, but this page
 * aggregates across scenarios, so we do not always have the roster at hand.
 * The id is a stable, honest fallback. When a scenario-specific page fetches
 * the roster, that page uses the actual player name instead.
 */
function humanise(playerId: string): string {
  const m = playerId.match(/^([A-Z]+)-p(\d{2})$/);
  if (!m) return playerId;
  const team = m[1] === "HOME" ? "Angaza" : "Mwangaza";
  const num = Number(m[2]);
  return `${team} #${num}`;
}
