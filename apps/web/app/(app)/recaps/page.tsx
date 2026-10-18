import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SCENARIOS } from "@/features/matches/scenarios";
import { getRecap } from "@/features/match/server";
import { getCurrentMatch } from "@/lib/currentMatch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecapsIndexPage() {
  const current = await getCurrentMatch();

  const results = await Promise.allSettled(
    SCENARIOS.map(async (s) => ({ scenario: s, recap: await getRecap(s.id, current.seed) })),
  );

  const rows = results
    .filter((r): r is PromiseFulfilledResult<{ scenario: typeof SCENARIOS[number]; recap: Awaited<ReturnType<typeof getRecap>> }> => r.status === "fulfilled")
    .map((r) => r.value);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Recaps</p>
          {current.live && <Badge tone="danger">Following live · {current.scenario.replace(/_/g, " ")}</Badge>}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Match stories</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Grounded recaps built from validated match state. No invented statistics.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ scenario, recap }) => {
          const isCurrent = scenario.id === current.scenario;
          return (
            <Card key={scenario.id} className={isCurrent ? "ring-1 ring-accent" : ""}>
              <CardHeader>
                <span className="text-sm font-medium capitalize">{scenario.label}</span>
                <span className="font-mono text-sm tabular-nums text-text">
                  {recap.recap.final_score.home}–{recap.recap.final_score.away}
                </span>
              </CardHeader>
              <CardBody className="flex flex-1 flex-col gap-3">
                <p className="text-sm leading-relaxed">{recap.recap.story}</p>
                <p className="text-xs leading-relaxed text-text-muted">{recap.recap.tactical_story}</p>
                <div className="mt-auto pt-3">
                  <Link href={`/matches/${scenario.id}/recap`} className="text-xs font-medium text-accent hover:underline">
                    Read full recap →
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
