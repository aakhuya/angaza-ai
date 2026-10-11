import Link from "next/link";

import { HeroBackdrop } from "@/components/marketing/HeroBackdrop";
import { HeroInsightCard } from "@/components/marketing/HeroInsightCard";
import { FeatureStrip } from "@/components/marketing/FeatureStrip";
import { Logo } from "@/components/marketing/Logo";
import { PipelineDiagram } from "@/components/marketing/PipelineDiagram";
import { Button } from "@/components/ui/Button";
import { findHeroImage } from "@/lib/heroImage";

export default function LandingPage() {
  const heroImage = findHeroImage();

  return (
    <div className="min-h-screen">
      <Header />

      {/* ─────────────── HERO ─────────────── */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <HeroBackdrop image={heroImage} />

        {/*
          Three-zone vertical grid:
          - top:    spacer so the header never overlaps the headline
          - middle: headline block, anchored to ~1/3 down
          - bottom: CTA + preview card, anchored to the base
        */}
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <div className="pt-28 sm:pt-32 lg:pt-40" />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/60 px-3 py-1 font-mono text-2xs uppercase tracking-[0.15em] text-text-muted backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" aria-hidden />
              Live pipeline · v0.1
            </span>

            <h1 className="mt-6 text-[2.75rem] font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Every moment
              <br />
              <span className="text-accent">has a story.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-text-muted sm:text-lg">
              Angaza AI turns synthetic football events into explainable match
              intelligence — not just what happened, but{" "}
              <span className="text-text">why</span>.
            </p>
          </div>

          <div className="mt-auto grid gap-8 pb-12 pt-12 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-16">
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/signup"><Button size="lg">Start exploring</Button></Link>
                <Link href="/login"><Button size="lg" variant="secondary">Sign in</Button></Link>
              </div>
              <p className="mt-5 max-w-md text-xs text-text-faint">
                Demo runs on synthetic match data. No real matches or copyrighted content are used.
              </p>
            </div>

            <div className="lg:col-span-6 lg:justify-self-end">
              <HeroInsightCard />
            </div>
          </div>
        </div>

        {/* Fade the bottom edge into the next section — one thin band. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(10,12,14,0) 0%, rgba(10,12,14,1) 100%)",
          }}
        />
      </section>

      {/* ─────────────── FEATURES ─────────────── */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
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

      {/* ─────────────── PIPELINE ─────────────── */}
      <section id="pipeline" className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.30]"
          style={{
            backgroundImage:
              "radial-gradient(900px 300px at 90% 0%, rgba(245,179,63,0.10), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
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

      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup"><Button size="sm">Get started</Button></Link>
        </div>
      </div>
    </header>
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

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Logo />
        <p className="text-xs text-text-faint">
          Built for the Microsoft Premier League Hackathon · Synthetic data only.
        </p>
      </div>
    </footer>
  );
}
