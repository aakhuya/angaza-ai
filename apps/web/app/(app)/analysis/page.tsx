import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SCENARIOS } from "@/features/matches/scenarios";
import { getSnapshot } from "@/features/match/server";
import { getCurrentMatch } from "@/lib/currentMatch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalysisIndexPage() {
  const current = await getCurrentMatch();

  const results = await Promise.allSettled(
    SCENARIOS.map(async (s) => ({ scenario: s, snapshot: await getSnapshot(s.id, current.seed) })),
  );

  const rows = results
    .filter((r): r is PromiseFulfilledResult<{ scenario: typeof SCENARIOS[number]; snapshot: Awaited<ReturnType<typeof getSnapshot>> }> => r.status === "fulfilled")
    .map((r) => r.value);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Analysis</p>
          {current.live ? (
            <Badge tone="danger">Following live · {current.scenario.replace(/_/g, " ")}</Badge>
          ) : (
            <Badge>Replay · {current.scenario.replace(/_/g, " ")}</Badge>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Analysis</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          {current.live
            ? "Reflecting the match you are currently watching."
            : "Every scenario is a deterministic replay. Same seed, same intelligence."}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ scenario, snapshot }) => {
          const s = snapshot.state;
          const isCurrent = scenario.id === current.scenario;
          return (
            <Card
              key={scenario.id}
              className={isCurrent ? "ring-1 ring-accent" : ""}
            >
              <CardHeader>
                <span className="text-sm font-medium capitalize">{scenario.label}</span>
                {isCurrent ? <Badge tone="accent">Current</Badge> : <Badge>seed {snapshot.seed}</Badge>}
              </CardHeader>
              <CardBody className="flex flex-1 flex-col gap-4">
                <p className="text-xs text-text-muted">{scenario.blurb}</p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <Stat label="Possession H" value={`${s.home.possession_pct}%`} />
                  <Stat label="Possession A" value={`${s.away.possession_pct}%`} />
                  <Stat label="Prog. passes H" value={s.home.progressive_passes} />
                  <Stat label="Prog. passes A" value={s.away.progressive_passes} />
                  <Stat label="Goals H" value={s.home.goals} />
                  <Stat label="Goals A" value={s.away.goals} />
                </dl>
                <div className="mt-auto pt-2">
                  <Link href={`/matches/${scenario.id}/analysis`} className="text-xs font-medium text-accent hover:underline">
                    Deep dive →
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-2xs uppercase tracking-wider text-text-faint">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-sm text-text" title={String(value)}>{value}</dd>
    </div>
  );
}
