import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SCENARIOS } from "@/features/matches/scenarios";
import { getRecap } from "@/features/match/server";

export default async function RecapPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario } = await params;
  const meta = SCENARIOS.find((s) => s.id === scenario);
  if (!meta) notFound();

  let body;
  try {
    const res = await getRecap(meta.id, 42);
    body = res.recap;
  } catch {
    return <ErrorState title="Recap unavailable" description="Could not load the recap for this scenario." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Recap</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight capitalize">
            {meta.label} · {body.final_score.home}–{body.final_score.away}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/matches/${meta.id}`}><Button variant="secondary">Live view</Button></Link>
          <Link href={`/matches/${meta.id}/analysis`}><Button variant="secondary">Analysis</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Match story</span>
          <Badge tone="teal">grounded</Badge>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm">{body.story}</p>
          <p className="text-sm text-text-muted">{body.tactical_story}</p>
        </CardBody>
      </Card>

      {body.turning_point && (
        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Turning point</span>
            <span className="font-mono text-2xs text-text-faint">
              {String(body.turning_point.minute).padStart(2, "0")}&apos;
            </span>
          </CardHeader>
          <CardBody>
            <p className="text-sm font-medium">{body.turning_point.title}</p>
            <p className="mt-1 text-sm text-text-muted">{body.turning_point.body}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Key moments</span>
          <span className="font-mono text-2xs text-text-faint">{body.key_moments.length}</span>
        </CardHeader>
        <CardBody>
          {body.key_moments.length === 0 ? (
            <EmptyState
              title="No insights published"
              description="Verification rejected anything it could not ground in the facts. Run the live match to populate the feed."
            />
          ) : (
            <ul className="divide-y divide-border">
              {body.key_moments.map((m, i) => (
                <li key={i} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xs tabular-nums text-text-faint">
                        {String(m.minute).padStart(2, "0")}&apos;
                      </span>
                      <Badge>{m.category.replace("_", " ")}</Badge>
                    </div>
                    <span className="font-mono text-2xs text-text-faint">
                      {(m.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{m.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Standout players</span>
        </CardHeader>
        <CardBody>
          {body.standout_players.length === 0 ? (
            <p className="text-sm text-text-muted">No standout players recorded.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {body.standout_players.map((p) => (
                <li key={p.player_id} className="rounded-md border border-border bg-bg-elevated px-3 py-3">
                  <Link
                    href={`/players/${encodeURIComponent(p.player_id)}?scenario=${meta.id}`}
                    className="text-sm font-medium hover:text-accent"
                  >
                    {p.player_id}
                  </Link>
                  <div className="mt-1 font-mono text-2xs text-text-faint">{p.team_id}</div>
                  <div className="mt-2 font-mono text-sm text-accent">
                    {p.involvement_score.toFixed(1)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Statistics</span>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {Object.entries(body.statistics).map(([key, [h, a]]) => (
              <div key={key}>
                <dt className="text-2xs uppercase tracking-wider text-text-faint">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="mt-0.5 font-mono text-sm text-text">{h} / {a}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
