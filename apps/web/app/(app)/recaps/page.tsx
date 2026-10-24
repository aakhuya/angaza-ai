import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SimBadge } from "@/components/ui/SimBadge";
import { getCurrentLive, getLiveRecap } from "@/features/match/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecapsPage() {
  const [current, data] = await Promise.all([
    getCurrentLive(),
    getLiveRecap().catch(() => null),
  ]);

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recaps</h1>
        <p className="mt-1 text-sm text-text-muted">Start a match to see its recap.</p>
      </div>
    );
  }

  const r = data.recap;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Recap</p>
          {current.live && <Badge tone="danger">Live · {current.match.scenario.replace(/_/g, " ")}</Badge>}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {data.match.match_id}
        </h1>
        <p className="mt-1 font-mono text-sm text-text-muted">
          Final score: {r.final_score.home} – {r.final_score.away}
        </p>
      </header>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Story</span>
          <div className="flex items-center gap-2"><Badge tone="teal">grounded</Badge><SimBadge /></div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm">{r.story}</p>
          <p className="text-sm text-text-muted">{r.tactical_story}</p>
        </CardBody>
      </Card>

      {r.turning_point && (
        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Turning point</span>
            <span className="font-mono text-2xs text-text-faint">
              {String(r.turning_point.minute).padStart(2, "0")}&apos;
            </span>
          </CardHeader>
          <CardBody>
            <p className="text-sm font-medium">{r.turning_point.title}</p>
            <p className="mt-1 text-sm text-text-muted">{r.turning_point.body}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Standout players</span>
        </CardHeader>
        <CardBody>
          {r.standout_players.length === 0 ? (
            <p className="text-sm text-text-muted">No standout players recorded.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.standout_players.map((p) => (
                <li key={p.player_id} className="rounded-md border border-border bg-bg-elevated px-3 py-3">
                  <div className="text-sm font-medium">{p.name ?? p.player_id}</div>
                  <div className="mt-1 text-xs text-text-faint">
                    {p.team_name ?? p.team_id}
                    {p.position ? ` · ${p.position}` : ""}
                    {p.number ? ` · #${p.number}` : ""}
                  </div>
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
            {Object.entries(r.statistics).map(([key, [h, a]]) => (
              <div key={key} className="min-w-0">
                <dt className="text-2xs uppercase tracking-wider text-text-faint">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="mt-0.5 truncate font-mono text-sm text-text tabular-nums">
                  {h} / {a}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
