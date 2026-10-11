import Link from "next/link";

import { HeroBackdrop } from "@/components/marketing/HeroBackdrop";
import { HeroInsightCard } from "@/components/marketing/HeroInsightCard";
import { FeatureStrip } from "@/components/marketing/FeatureStrip";
import { Logo } from "@/components/marketing/Logo";
import { Button } from "@/components/ui/Button";
import { findHeroImage } from "@/lib/heroImage";

export default function LandingPage() {
  const heroImage = findHeroImage();

  return (
    <div className="min-h-screen">
      <Header />

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative isolate overflow-hidden lg:min-h-[100svh]">
        <HeroBackdrop image={heroImage} />

        <div className="relative mx-auto flex max-w-7xl flex-col px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-36 lg:min-h-[100svh] lg:px-10 lg:pb-24 lg:pt-40">
          {/*
            Two-column hero on lg+, single column on mobile.
            Left:  headline block.
            Right: insight card, vertically centered against the headline.
          */}
          <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="w-full max-w-3xl text-center lg:col-span-6 lg:text-left">
              <h1 className="text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
                Every moment
                <br />
                <span className="text-accent">has a story.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-relaxed text-text-muted sm:mt-10 sm:text-lg max-lg:mx-auto">
                Angaza AI turns synthetic football events into explainable match
                intelligence — not just what happened, but{" "}
                <span className="text-text">why</span>.
              </p>
            </div>

            <div className="flex w-full justify-center lg:col-span-6 lg:justify-end">
              <HeroInsightCard />
            </div>
          </div>
        </div>

        {/* Single bottom fade into the next section */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(10,12,14,0) 0%, rgba(10,12,14,1) 100%)",
          }}
        />
      </section>

      {/* ─────────────────────── CAPABILITIES ─────────────────────── */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
              Capabilities
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for the moments that matter
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              Deterministic analytics do the math. Agents explain why it mattered.
              A verification layer refuses to publish anything it can&apos;t ground.
            </p>
          </div>
          <div className="mt-8">
            <FeatureStrip />
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Logo />
          {/* Status pill next to the logo — matches the reference layout. */}
          <span className="hidden items-center gap-2 rounded-full border border-border bg-bg/60 px-3 py-1 font-mono text-2xs uppercase tracking-[0.15em] text-text-muted backdrop-blur sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" aria-hidden />
            Live pipeline · v0.1
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup"><Button size="sm">Get started</Button></Link>
        </div>
      </div>
    </header>
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
