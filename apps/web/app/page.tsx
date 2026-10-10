import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";
import { FeatureStrip } from "@/components/marketing/FeatureStrip";
import { PipelineDiagram } from "@/components/marketing/PipelineDiagram";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#about", label: "About" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Marketing">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-md px-3 py-2 text-sm text-text-muted hover:text-text focus-ring"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(1200px 400px at 80% -10%, rgba(240,169,58,0.18), transparent 60%), radial-gradient(900px 300px at 10% 110%, rgba(79,189,176,0.10), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-1 font-mono text-2xs uppercase tracking-[0.15em] text-text-muted">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" aria-hidden />
              Live pipeline · v0.1
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Every Moment<br />
              <span className="text-accent">Has a Story.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-text-muted">
              Angaza AI transforms football events into explainable match intelligence,
              giving you more than just statistics — you get the <span className="text-text">why</span>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup"><Button size="lg">Start Exploring</Button></Link>
              <Link href="/login"><Button size="lg" variant="secondary">Sign in</Button></Link>
            </div>

            <p className="mt-6 max-w-lg text-xs text-text-faint">
              This is a demo using synthetic match data. No real matches or copyrighted content are used.
            </p>
          </div>

          <div className="relative">
            <HeroPanel />
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="Capabilities"
            title="Built for the moments that matter"
            body="A purpose-built pipeline, not a chatbot wrapped around a stats table."
          />
          <div className="mt-8">
            <FeatureStrip />
          </div>
        </div>
      </section>

      <section id="pipeline" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="Architecture"
            title="Five-stage intelligence pipeline"
            body="Deterministic analytics do the math. Agents explain why it mattered. A verification layer refuses to publish anything it can't ground."
          />
          <div className="mt-8">
            <PipelineDiagram />
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-1">
            <SectionHeading kicker="Why Angaza" title="The system explains WHY it mattered." body="" />
          </div>
          <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
            {[
              ["Deterministic core", "Possession, progression, pressure, and momentum computed in pure Python. No LLM arithmetic."],
              ["Grounded agents", "Agents reason over a frozen FactBundle. Verification rejects unknown IDs or unverified numbers."],
              ["Personalization that respects facts", "Tone and depth adapt per viewer. Numbers never move."],
              ["Real transparency", "The /agents page reads execution rows from the backend. Nothing is faked."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-border bg-bg-surface p-5">
                <div className="text-sm font-medium">{title}</div>
                <p className="mt-2 text-sm text-text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <Logo />
          <p className="text-xs text-text-faint">
            Built for the Microsoft Premier League Hackathon · Synthetic data only.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ kicker, title, body }: { kicker: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">{kicker}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {body && <p className="mt-3 text-sm text-text-muted">{body}</p>}
    </div>
  );
}

function HeroPanel() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg-surface shadow-pop">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger/80" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-accent/80" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-success/80" aria-hidden />
        </div>
        <span className="font-mono text-2xs uppercase tracking-wider text-text-faint">
          match_intelligence · live
        </span>
      </div>
      <div className="space-y-3 p-4">
        <PitchPreview />
        <InsightPreview
          minute="72:14"
          category="TACTICAL SHIFT"
          title="Angaza detected a sustained increase in pressure"
          body="Team A increased final-third entries while forcing three possession changes in the last four minutes."
          tone="accent"
        />
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Possession", "61%"],
            ["Prog. passes", "34"],
            ["Pressures", "18"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-border bg-bg-elevated px-3 py-2.5">
              <div className="text-2xs uppercase tracking-wider text-text-faint">{label}</div>
              <div className="mt-1 font-mono text-sm text-text">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PitchPreview() {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-border bg-[#0E1512]">
      <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x="6" y="6" width="148" height="78" fill="none" stroke="#2A3A33" strokeWidth="0.6" />
        <line x1="80" y1="6" x2="80" y2="84" stroke="#2A3A33" strokeWidth="0.6" />
        <circle cx="80" cy="45" r="10" fill="none" stroke="#2A3A33" strokeWidth="0.6" />
        <rect x="6" y="26" width="14" height="38" fill="none" stroke="#2A3A33" strokeWidth="0.6" />
        <rect x="140" y="26" width="14" height="38" fill="none" stroke="#2A3A33" strokeWidth="0.6" />
        {[
          [30, 30], [48, 24], [62, 40], [70, 55], [88, 30], [102, 50], [118, 34], [130, 60],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill={i % 2 ? "#F0A93A" : "#4FBDB0"} />
        ))}
        <path d="M62 40 L88 30 L102 50" fill="none" stroke="#F0A93A" strokeWidth="0.9" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

function InsightPreview({
  minute, category, title, body, tone,
}: { minute: string; category: string; title: string; body: string; tone: "accent" | "teal" }) {
  const toneClass = tone === "accent" ? "border-accent-soft bg-accent/5" : "border-teal-soft bg-teal/5";
  const badgeClass = tone === "accent" ? "border-accent-soft text-accent" : "border-teal-soft text-teal";
  return (
    <div className={`rounded-md border ${toneClass} p-3`}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-2xs tabular-nums text-text-muted">{minute}</span>
        <span className={`rounded border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${badgeClass}`}>
          {category}
        </span>
      </div>
      <div className="mt-2 text-sm font-medium">{title}</div>
      <p className="mt-1 text-xs text-text-muted">{body}</p>
    </div>
  );
}
