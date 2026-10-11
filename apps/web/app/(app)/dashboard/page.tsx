import Link from "next/link";

import { Pitch } from "@/components/match/Pitch";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getPreferences, getProfile } from "@/features/settings/server";
import { getExecutions } from "@/features/agents/client";
import { serverApi } from "@/lib/api-server";
import type { AgentExecution, MatchState } from "@/types/api";

async function fetchState(): Promise<MatchState | null> {
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
  const [profile, preferences, state, agents] = await Promise.all([
    getProfile().catch(() => ({ display_name: "", favorite_team: "", favorite_player: "" })),
    getPreferences().catch(() => ({ viewer_mode: "analyst" as const, language: "en", explanation_detail: "standard" as const })),
    fetchState(),
    getExecutions("balanced-42-analyst", 6).catch(() => ({ match_id: "", count: 0, executions: [] })),
  ]);

  const greeting = profile.display_name || "there";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="min-w-0 space-y-6">
        <HeroBanner greeting={greeting} />
        <StatTiles state={state} />
        <LiveAndInsights state={state} executions={agents.executions} viewerMode={preferences.viewer_mode} />
        <ActionGrid />
      </div>

      <Rail state={state} executions={agents.executions} />
    </div>
  );
}

function HeroBanner({ greeting }: { greeting: string }) {
  return (
    <section className="relative isolate overflow-hidden rounded-xl border border-border">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 400px at 85% 20%, rgba(245,179,63,0.18), transparent 60%), radial-gradient(700px 300px at 5% 100%, rgba(79,189,176,0.12), transparent 60%), linear-gradient(180deg, #0C1013 0%, #090B0D 100%)",
        }}
      />
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8 lg:p-8">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
            Welcome back, {greeting.toUpperCase()}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            Football intelligence
            <br />
            <span className="text-accent">for a deeper game.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm text-text-muted">
            Live matches. Smart insights. Real stories.
            <br />
            Angaza AI turns every moment on the pitch into meaningful, explainable intelligence.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/matches"><Button>Explore matches →</Button></Link>
            <Button variant="secondary">Watch demo</Button>
          </div>
        </div>

        <ol className="grid grid-cols-1 gap-2.5 self-center lg:grid-cols-1">
          {[
            ["Ingest", "Live event stream"],
            ["Interpret", "Statistical analysis"],
            ["Explain", "AI-powered insights"],
            ["Render", "Visual intelligence"],
            ["Personalize", "Your experience"],
          ].map(([label, sub], i) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-md border border-border bg-bg-surface/85 px-3 py-2 backdrop-blur"
            >
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-soft bg-accent/10 text-accent"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3">
                  {i === 0 && <path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
                  {i === 1 && <path d="M4 20V8M9 20V4M14 20V12M19 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
                  {i === 2 && <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
                  {i === 3 && <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>}
                  {i === 4 && <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>}
                </svg>
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium">{label}</div>
                <div className="text-2xs text-text-faint">{sub}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StatTiles({ state }: { state: MatchState | null }) {
  const tiles = [
    { label: "Active matches", value: "2", sub: "Live now", icon: "ball" as const },
    { label: "Total players", value: "342", sub: "Across all matches", icon: "user" as const },
    { label: "Insights generated", value: state ? String(state.total_events) : "—", sub: "This week", icon: "spark" as const },
    { label: "Your watchlist", value: "5", sub: "Teams & players", icon: "star" as const },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-lg border border-border bg-bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-2xs uppercase tracking-wider text-text-faint">{t.label}</span>
            <TileIcon name={t.icon} />
          </div>
          <div className="mt-3 font-mono text-2xl text-text">{t.value}</div>
          <div className="mt-1 text-2xs text-text-muted">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

function TileIcon({ name }: { name: "ball" | "user" | "spark" | "star" }) {
  const cls = "h-4 w-4 text-accent";
  switch (name) {
    case "ball":
      return <svg viewBox="0 0 24 24" className={cls} aria-hidden><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M12 6l3 3-1.5 4h-3L9 9z" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>;
    case "user":
      return <svg viewBox="0 0 24 24" className={cls} aria-hidden><circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M6 20c1.5-3 3.5-4.5 6-4.5S16.5 17 18 20" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>;
    case "spark":
      return <svg viewBox="0 0 24 24" className={cls} aria-hidden><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
    case "star":
      return <svg viewBox="0 0 24 24" className={cls} aria-hidden><path d="M12 3l2.6 5.6 6 .6-4.5 4 1.4 5.9-5.5-3.1-5.5 3.1 1.4-5.9-4.5-4 6-.6z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/></svg>;
  }
}

function LiveAndInsights({
  state, executions, viewerMode,
}: { state: MatchState | null; executions: AgentExecution[]; viewerMode: string }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
      {/* Live match card */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-danger" aria-hidden />
            <span className="font-mono text-2xs uppercase tracking-wider text-danger">Live</span>
            <Badge>Premier League</Badge>
          </div>
          <span className="font-mono text-2xs text-text-faint">32:14</span>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-center justify-between">
            <TeamBlock name="Man City" side="home" />
            <div className="text-center">
              <div className="font-mono text-3xl tabular-nums">
                {state?.home_score ?? 1} <span className="text-text-faint">–</span> {state?.away_score ?? 0}
              </div>
              <div className="mt-1 font-mono text-2xs text-text-faint">1st half</div>
            </div>
            <TeamBlock name="Arsenal" side="away" />
          </div>
        </div>

        <div className="mt-4">
          <Pitch
            formation="4-3-3"
            arrows={[
              { from: { x: 0.30, y: 0.35 }, to: { x: 0.58, y: 0.22 }, tone: "accent", dashed: true },
              { from: { x: 0.34, y: 0.55 }, to: { x: 0.64, y: 0.55 }, tone: "accent" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-4">
          <StatBar label="Possession" home={state?.home.possession_pct ?? 52} away={state?.away.possession_pct ?? 48} />
          <StatBar label="Pass accuracy" home={state?.home.pass_accuracy ?? 89} away={state?.away.pass_accuracy ?? 82} />
          <SimpleStat label="Shots" home={state?.home.shots ?? 7} away={state?.away.shots ?? 3} />
          <SimpleStat label="Shots on target" home={state?.home.shots_on_target ?? 4} away={state?.away.shots_on_target ?? 1} />
        </div>

        <div className="border-t border-border px-4 py-3">
          <Link href="/matches/balanced">
            <Button size="sm" variant="secondary" className="w-full">View live match →</Button>
          </Link>
        </div>
      </Card>

      {/* Latest insight */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-wider text-accent">Tactical analysis</span>
          </div>
          <Link href="/matches/balanced" className="text-2xs text-text-muted hover:text-text">See all →</Link>
        </CardHeader>
        <CardBody className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="rounded border border-accent-soft bg-accent/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-accent">
              High pressure
            </span>
            <span className="font-mono text-2xs text-text-faint">32:14</span>
          </div>
          <h3 className="mt-3 text-base font-medium leading-snug">
            City&apos;s high press forces Arsenal into 3 turnovers in 5 minutes.
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            Manchester City&apos;s front three have increased their pressing
            intensity, forcing Arsenal into defensive errors in their own half.
            This has led to 2 dangerous attacks and 1 shot on target.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["Turnovers", "3"],
              ["Chances created", "2"],
              ["Shots on target", "1"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-border bg-bg-elevated px-2.5 py-2">
                <div className="font-mono text-sm text-text">{value}</div>
                <div className="mt-0.5 text-2xs text-text-faint">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-2xs text-text-faint">
              <span>Confidence</span>
              <span className="font-mono text-accent">87%</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
              <div className="h-full rounded-full bg-accent" style={{ width: "87%" }} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Agent activity */}
      <Card>
        <CardHeader>
          <span className="text-sm font-medium">AI agent activity</span>
          <Link href="/agents" className="text-2xs text-text-muted hover:text-text">View all →</Link>
        </CardHeader>
        <CardBody className="space-y-2">
          {executions.length === 0 ? (
            <p className="text-xs text-text-muted">No agent runs recorded yet.</p>
          ) : (
            executions.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <span
                  className={[
                    "mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                    e.status === "ok" ? "bg-success" : e.status === "rejected" ? "bg-danger" : "bg-text-faint",
                  ].join(" ")}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium capitalize">
                    {e.agent.replace(/_/g, " ")}
                  </div>
                  <div className="mt-0.5 truncate text-2xs text-text-faint">
                    {e.duration_ms}ms · {e.provider ?? "—"}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function TeamBlock({ name, side }: { name: string; side: "home" | "away" }) {
  const color = side === "home" ? "bg-accent" : "bg-teal";
  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${color} font-mono text-xs font-semibold text-bg`}>
        {name.slice(0, 2).toUpperCase()}
      </span>
      <span className="text-xs font-medium">{name}</span>
    </div>
  );
}

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-2xs text-text-muted">
        <span className="font-mono text-text">{home}%</span>
        <span>{label}</span>
        <span className="font-mono text-text">{away}%</span>
      </div>
      <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-bg-elevated">
        <div className="bg-accent" style={{ width: `${homePct}%` }} />
        <div className="bg-teal" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  );
}

function SimpleStat({ label, home, away }: { label: string; home: number; away: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-2xs text-text-muted">
        <span className="font-mono text-text">{home}</span>
        <span>{label}</span>
        <span className="font-mono text-text">{away}</span>
      </div>
    </div>
  );
}

function ActionGrid() {
  const items = [
    { title: "Match analysis", body: "Deep dive into tactics, patterns and key moments.", cta: "Explore analysis", href: "/analysis" },
    { title: "Player profiles", body: "Detailed stats, heatmaps and performance trends.", cta: "View players", href: "/players" },
    { title: "Match recaps", body: "AI-generated stories from every match.", cta: "Read recaps", href: "/recaps" },
    { title: "Your personalization", body: "Customise your experience and get insights that matter to you.", cta: "Manage preferences", href: "/settings/preferences" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((i) => (
        <Card key={i.title} className="flex flex-col">
          <CardBody className="flex flex-1 flex-col">
            <div className="text-sm font-medium">{i.title}</div>
            <p className="mt-1.5 text-xs text-text-muted">{i.body}</p>
            <div className="mt-auto pt-4">
              <Link href={i.href}>
                <Button size="sm" variant="secondary">{i.cta} →</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function Rail({ state, executions }: { state: MatchState | null; executions: AgentExecution[] }) {
  const upcoming = [
    { time: "Today · 3:00 PM", home: "Man City", away: "Arsenal" },
    { time: "Today · 5:30 PM", home: "Liverpool", away: "Chelsea" },
    { time: "Tomorrow · 2:00 PM", home: "Man United", away: "Tottenham" },
    { time: "Tomorrow · 4:30 PM", home: "Newcastle", away: "Aston Villa" },
  ];
  const rows = [
    { min: "28:42", event: "Goal", detail: "Man City 1 - 0 Arsenal", tone: "high" as const },
    { min: "24:17", event: "Tactical shift", detail: "Arsenal increased width…", tone: "medium" as const },
    { min: "18:03", event: "Key pass", detail: "De Bruyne through ball", tone: "high" as const },
    { min: "12:26", event: "Defensive action", detail: "Saliba interception", tone: "medium" as const },
    { min: "05:14", event: "Shot on target", detail: "Haaland header", tone: "high" as const },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Upcoming matches</span>
          <Link href="/matches" className="text-2xs text-text-muted hover:text-text">View all →</Link>
        </CardHeader>
        <CardBody className="space-y-2">
          {upcoming.map((u) => (
            <div key={u.time + u.home} className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-elevated px-3 py-2.5">
              <div className="min-w-0">
                <div className="font-mono text-2xs text-text-faint">{u.time}</div>
                <div className="mt-1 truncate text-xs">
                  <span className="font-medium">{u.home}</span>
                  <span className="mx-1.5 text-text-faint">vs</span>
                  <span className="font-medium">{u.away}</span>
                </div>
              </div>
              <Link href="/matches/balanced"><Button size="sm" variant="secondary">Simulate</Button></Link>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Match intelligence</span>
        </CardHeader>
        <div className="border-b border-border px-4">
          <div className="flex gap-4 text-2xs uppercase tracking-wider">
            {["Recent", "Top", "Tactical", "Player"].map((t, i) => (
              <button
                key={t}
                type="button"
                className={[
                  "border-b-2 py-2.5",
                  i === 0 ? "border-accent text-text" : "border-transparent text-text-faint hover:text-text",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <CardBody className="space-y-2">
          {rows.map((r) => (
            <div key={r.min} className="flex items-start gap-3">
              <span className="w-10 shrink-0 font-mono text-2xs tabular-nums text-text-faint">{r.min}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{r.event}</div>
                <div className="truncate text-2xs text-text-faint">{r.detail}</div>
              </div>
              <Badge tone={r.tone === "high" ? "accent" : "neutral"}>
                {r.tone}
              </Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      {state && (
        <Card className="hidden xl:block">
          <CardHeader>
            <span className="text-sm font-medium">Your preferred teams</span>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {["MCI", "ARS", "LIV", "CHE", "MUN"].map((t) => (
                <span
                  key={t}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-elevated font-mono text-2xs text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </aside>
  );
}
