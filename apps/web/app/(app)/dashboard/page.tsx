import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { serverApi } from "@/lib/api-server";
import type { MatchState, Preferences, Profile } from "@/types/api";

async function fetchRecentState(): Promise<MatchState | null> {
  try {
    const res = await serverApi.get<{ scenario: string; seed: number; state: MatchState }>(
      "/scenarios/balanced/snapshot?seed=42",
    );
    return res.state;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const [profile, preferences, state] = await Promise.all([
    serverApi.get<Profile>("/profile").catch(
      (): Profile => ({ display_name: "", favorite_team: "", favorite_player: "" }),
    ),
    serverApi.get<Preferences>("/preferences").catch(
      (): Preferences => ({ viewer_mode: "analyst", language: "en", explanation_detail: "standard" }),
    ),
    fetchRecentState(),
  ]);

  const greetingName = profile.display_name || "there";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome back, {greetingName}.</h1>
          <p className="mt-1 text-sm text-text-muted">
            Pick a scenario and let the pipeline run. Every insight is grounded in validated facts.
          </p>
        </div>
        <Link href="/matches"><Button>Open matches</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Viewer mode</span>
            <Badge tone="accent">{preferences.viewer_mode}</Badge>
          </CardHeader>
          <CardBody className="text-sm text-text-muted">
            Personalization rewrites tone, depth, and emphasis — never the underlying numbers.
            Change it in <Link className="text-accent hover:underline" href="/settings/preferences">Preferences</Link>.
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Favorite club</span>
            <Badge>{profile.favorite_team ? "set" : "unset"}</Badge>
          </CardHeader>
          <CardBody className="text-sm text-text-muted">
            {profile.favorite_team || "Not set yet."}{" "}
            {profile.favorite_player && <>· Player: {profile.favorite_player}</>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-sm font-medium">Pipeline</span>
            <Badge tone="teal">live</Badge>
          </CardHeader>
          <CardBody className="font-mono text-2xs text-text-muted">
            INGEST → INTERPRET → EXPLAIN → RENDER → PERSONALIZE
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Latest simulated snapshot</span>
          {state && <Badge>{state.total_events} events</Badge>}
        </CardHeader>
        <CardBody>
          {!state ? (
            <p className="text-sm text-text-muted">Could not load sample state. Ensure the API is running.</p>
          ) : (
            <SnapshotGrid state={state} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function SnapshotGrid({ state }: { state: MatchState }) {
  const rows: Array<[string, string | number]> = [
    ["Possession (home)", `${state.home.possession_pct}%`],
    ["Possession (away)", `${state.away.possession_pct}%`],
    ["Progressive passes (H)", state.home.progressive_passes],
    ["Progressive passes (A)", state.away.progressive_passes],
    ["Shots on target (H)", state.home.shots_on_target],
    ["Shots on target (A)", state.away.shots_on_target],
    ["Final-third entries (H)", state.home.final_third_entries],
    ["Final-third entries (A)", state.away.final_third_entries],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-2xs uppercase tracking-wider text-text-faint">{label}</dt>
          <dd className="mt-0.5 truncate font-mono text-sm text-text" title={String(value)}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
