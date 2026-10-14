import Image from "next/image";
import Link from "next/link";

import { Pitch } from "@/components/match/Pitch";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getPreferences, getProfile } from "@/features/settings/server";
import { getExecutions } from "@/features/agents/client";
import { requireOnboarded } from "@/lib/firstRun";
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
  await requireOnboarded();

  const [profile, preferences, state, agents] = await Promise.all([
    getProfile().catch(() => ({ display_name: "", favorite_team: "", favorite_player: "" })),
    getPreferences().catch(() => ({ viewer_mode: "analyst" as const, language: "en", explanation_detail: "standard" as const })),
    fetchState(),
    getExecutions("balanced-42-analyst", 8).catch(() => ({ match_id: "", count: 0, executions: [] })),
  ]);

  const greeting = profile.display_name || "there";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <HeroBanner greeting={greeting} />

      {/* ── LIVE NOW ──────────────────────────────────────────────── */}
      <LiveBand state={state} />

      {/* ── INSIGHT + AGENTS (two columns) ───────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <LatestInsight />
        <AgentActivity executions={agents.executions} />
      </div>

      {/* ── SUPPORTING CARDS ─────────────────────────────────────── */}
      <SupportGrid viewerMode={preferences.viewer_mode} />
    </div>
  );
}

/* ─────────── HERO ─────────── */

function HeroBanner({ greeting }: { greeting: string }) {
  return (
    <section className="relative isolate overflow-hidden rounded-xl border border-border">
      <div className="relative min-h-[360px] sm:min-h-[400px] lg:min-h-[440px]">
        <Image
          src="/media/dashboard-hero.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover object-[78%_30%] sm:object-[72%_center] lg:object-[72%_center]"
        />
        {/* Scrim: dark on the left for the headline, lighter on the right so the player reads. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)",
          }}
        />

        <div className="relative flex h-full flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-accent">
            Welcome back, {greeting.split(" ")[0].toUpperCase()}
          </p>
          <div className="mt-auto max-w-xl pb-1">
            <h1 className="text-[1.75rem] font-semibold leading-[1.05] tracking-tight sm:text-[2.25rem] lg:text-[2.5rem]">
              Football intelligence
              <br />
              <span className="text-accent">for a deeper game.</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
              Live matches. Smart insights. Real stories.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/matches"><Button>Explore matches →</Button></Link>
              <Link href="/agents"><Button variant="secondary">Agent activity</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── LIVE BAND ─────────── */

function LiveBand({ state }: { state: MatchState | null }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-danger" aria-hidden />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-danger">
            Live now
          </span>
          <span className="text-xs text-text-faint">·</span>
          <span className="text-xs text-text-muted">Angaza FC vs Mwangaza United</span>
        </div>
        <Link href="/matches/balanced" className="text-xs text-text-muted hover:text-text">
          Open match →
        </Link>
      </div>

      <div className="grid gap-5 rounded-xl border border-border bg-bg-surface p-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:p-6">
        <div>
          <ScoreBlock state={state} />
          <div className="mt-5">
            <Pitch
              formation="4-3-3"
              arrows={[
                { from: { x: 0.30, y: 0.35 }, to: { x: 0.58, y: 0.22 }, tone: "accent", dashed: true },
                { from: { x: 0.34, y: 0.55 }, to: { x: 0.64, y: 0.55 }, tone: "accent" },
              ]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <MiniStats state={state} />
        </div>
      </div>
    </section>
  );
}

function ScoreBlock({ state }: { state: MatchState | null }) {
  const home = state?.home_score ?? 1;
  const away = state?.away_score ?? 0;
  const minute = state?.minute ?? 32;
  const second = state?.second ?? 14;
  return (
    <div className="flex items-center justify-between gap-6">
      <TeamPill label="Angaza FC" side="home" />
      <div className="text-center">
        <div className="font-mono text-4xl tabular-nums tracking-tight">
          {home} <span className="text-text-faint">·</span> {away}
        </div>
        <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-text-faint">
          {String(minute).padStart(2, "0")}:{String(second).padStart(2, "0")} · 1st half
        </div>
      </div>
      <TeamPill label="Mwangaza Utd" side="away" />
    </div>
  );
}

function TeamPill({ label, side }: { label: string; side: "home" | "away" }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full font-mono text-[0.7rem] font-semibold",
          side === "home" ? "bg-accent text-bg" : "bg-teal text-bg",
        ].join(" ")}
      >
        {label.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
      </span>
      <span className="truncate text-xs font-medium">{label}</span>
    </div>
  );
}

function MiniStats({ state }: { state: MatchState | null }) {
  const rows: Array<[string, string, string]> = [
    ["Possession", `${state?.home.possession_pct ?? 52}%`, `${state?.away.possession_pct ?? 48}%`],
    ["Pass accuracy", `${state?.home.pass_accuracy ?? 89}%`, `${state?.away.pass_accuracy ?? 82}%`],
    ["Shots", `${state?.home.shots ?? 7}`, `${state?.away.shots ?? 3}`],
    ["On target", `${state?.home.shots_on_target ?? 4}`, `${state?.away.shots_on_target ?? 1}`],
  ];
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-bg-elevated">
      {rows.map(([label, h, a]) => (
        <div key={label} className="grid grid-cols-3 items-center px-4 py-3">
          <span className="font-mono text-sm tabular-nums text-text">{h}</span>
          <span className="text-center text-2xs uppercase tracking-wider text-text-faint">
            {label}
          </span>
          <span className="text-right font-mono text-sm tabular-nums text-text">{a}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────── LATEST INSIGHT ─────────── */

function LatestInsight() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-accent">
            Latest insight
          </span>
          <Badge tone="accent">Tactical</Badge>
        </div>
        <span className="font-mono text-2xs text-text-faint">32:14</span>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col gap-4">
        <h3 className="text-lg font-medium leading-snug tracking-tight">
          Angaza FC&apos;s high press forces three turnovers in five minutes.
        </h3>
        <p className="text-sm leading-relaxed text-text-muted">
          The front three have increased their pressing intensity, forcing
          Mwangaza United into defensive errors in their own half. Two
          dangerous attacks and one shot on target followed.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            ["Turnovers", "3"],
            ["Chances", "2"],
            ["Shots on target", "1"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-border bg-bg-elevated px-3 py-2.5">
              <div className="font-mono text-lg text-text">{value}</div>
              <div className="mt-0.5 text-2xs uppercase tracking-wider text-text-faint">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-2xs text-text-faint">
            <span>Confidence</span>
            <span className="font-mono text-accent">87%</span>
          </div>
          <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-bg-raised">
            <div className="h-full rounded-full bg-accent" style={{ width: "87%" }} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─────────── AGENT ACTIVITY ─────────── */

function AgentActivity({ executions }: { executions: AgentExecution[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <span className="text-sm font-medium">Agent activity</span>
        <Link href="/agents" className="text-2xs text-text-muted hover:text-text">
          View all →
        </Link>
      </CardHeader>
      <CardBody className="flex-1">
        {executions.length === 0 ? (
          <p className="text-xs text-text-muted">
            Start a match to populate the trace.
          </p>
        ) : (
          <ul className="space-y-3">
            {executions.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <span
                  className={[
                    "mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                    e.status === "ok" ? "bg-success" : e.status === "rejected" ? "bg-danger" : "bg-text-faint",
                  ].join(" ")}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium capitalize">
                    {e.agent.replace(/_/g, " ")}
                  </div>
                  <div className="mt-0.5 font-mono text-[0.62rem] text-text-faint">
                    {e.duration_ms}ms · {e.provider ?? "—"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/* ─────────── SUPPORTING CARDS ─────────── */

function SupportGrid({ viewerMode }: { viewerMode: string }) {
  const items = [
    {
      title: "Match analysis",
      body: "Tactical patterns, key moments, deep stats.",
      cta: "Explore",
      href: "/analysis",
      image: "/media/thumb-analysis.jpg",
    },
    {
      title: "Player profiles",
      body: "Heatmaps, trends, involvement scores.",
      cta: "View",
      href: "/players",
      image: "/media/thumb-player.jpg",
    },
    {
      title: "Match recaps",
      body: "Grounded stories from every match.",
      cta: "Read",
      href: "/recaps",
      image: "/media/thumb-recap.jpg",
    },
    {
      title: "Your preferences",
      body: `Viewing as ${viewerMode.replace("_", " ")}.`,
      cta: "Manage",
      href: "/settings/preferences",
      image: null,
    },
  ];

  return (
    <section>
      <div className="mb-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-text-faint">
          Explore
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <Card key={i.title} className="flex flex-col overflow-hidden">
            <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-bg-elevated">
              {i.image ? (
                <Image
                  src={i.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(400px 180px at 25% 25%, rgba(245,179,63,0.18), transparent 60%), radial-gradient(400px 180px at 85% 90%, rgba(79,189,176,0.12), transparent 60%)",
                  }}
                />
              )}
            </div>
            <CardBody className="flex flex-1 flex-col">
              <div className="text-sm font-medium">{i.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">{i.body}</p>
              <div className="mt-auto pt-4">
                <Link
                  href={i.href}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  {i.cta} →
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
