import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getCurrentLive, getLiveSnapshot } from "@/features/match/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalysisPage() {
  const [current, snapshot] = await Promise.all([
    getCurrentLive(),
    getLiveSnapshot().catch(() => null),
  ]);

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Analysis</h1>
          <p className="mt-1 text-sm text-text-muted">
            Start a match to see live analysis.
          </p>
        </header>
      </div>
    );
  }

  const s = snapshot.state;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Analysis</p>
          {current.live ? (
            <Badge tone="danger">Following live · {current.match.scenario.replace(/_/g, " ")}</Badge>
          ) : (
            <Badge>Replay · {current.match.scenario.replace(/_/g, " ")}</Badge>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {snapshot.match.match_id}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {s.total_events} events · {(s.home.goals)}–{(s.away.goals)}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <span className="text-sm font-medium">{s.home.team_id}</span>
            <Badge tone="accent">{s.home.possession_pct}% poss</Badge>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <Kv label="Pass accuracy" value={`${s.home.pass_accuracy.toFixed(0)}%`} />
            <Kv label="Prog. passes" value={s.home.progressive_passes} />
            <Kv label="Final-third entries" value={s.home.final_third_entries} />
            <Kv label="Shots (on target)" value={`${s.home.shots} (${s.home.shots_on_target})`} />
            <Kv label="Pressures" value={s.home.pressures} />
            <Kv label="Interceptions" value={s.home.interceptions} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-sm font-medium">{s.away.team_id}</span>
            <Badge tone="teal">{s.away.possession_pct}% poss</Badge>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <Kv label="Pass accuracy" value={`${s.away.pass_accuracy.toFixed(0)}%`} />
            <Kv label="Prog. passes" value={s.away.progressive_passes} />
            <Kv label="Final-third entries" value={s.away.final_third_entries} />
            <Kv label="Shots (on target)" value={`${s.away.shots} (${s.away.shots_on_target})`} />
            <Kv label="Pressures" value={s.away.pressures} />
            <Kv label="Interceptions" value={s.away.interceptions} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Top moments</span>
          <span className="font-mono text-2xs text-text-faint">
            {snapshot.insight_count} insights published
          </span>
        </CardHeader>
        <CardBody>
          <ul className="divide-y divide-border">
            {snapshot.top_insights.map((m, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <span className="font-mono text-2xs text-text-faint">
                  {String(m.minute).padStart(2, "0")}:{String(m.second).padStart(2, "0")}
                </span>
                <span className="text-sm capitalize">{m.event_type.replace(/_/g, " ")}</span>
                <span className="text-xs text-text-muted">{m.team_id}</span>
                <span className="ml-auto font-mono text-xs text-accent">
                  {(m.importance * 100).toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-2xs uppercase tracking-wider text-text-faint">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-sm text-text">{value}</dd>
    </div>
  );
}
