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

      {/* ─────────────── HERO ─────────────── */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <HeroBackdrop image={heroImage} />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          {/*
            Upper half: headline on the left, insight card on the right.
            On mobile the card stacks below the headline, still inside the
            upper half — CTAs live at the base of the frame.
          */}
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-7">
              <h1 className="text-[2.6rem] font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                Every moment
                <br />
                <span className="text-accent">has a story.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
                Angaza AI turns football events into explainable match
                intelligence — not just what happened, but{" "}
                <span className="text-text">why</span>.
              </p>
            </div>

            <div className="lg:col-span-5 lg:justify-self-end">
              <HeroInsightCard />
            </div>
          </div>

          {/* CTA strip anchored to the base of the hero. */}
          <div className="mt-auto flex flex-wrap items-center gap-3 pb-14 pt-16 lg:pb-20">
            <Link href="/signup"><Button size="lg">Start exploring</Button></Link>
            <Link href="/login"><Button size="lg" variant="secondary">Sign in</Button></Link>
            <p className="w-full text-xs text-text-faint sm:w-auto sm:pl-2">
              Demo runs on synthetic match data. No real matches or copyrighted content are used.
            </p>
          </div>
        </div>

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
          <div className="max-w-2xl">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
              Capabilities
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for the moments that matter
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              A purpose-built pipeline — not a chatbot wrapped around a stats table.
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
