import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Angaza AI</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            Illuminate Every Moment.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-text-muted">
            A football match intelligence platform that turns synthetic events
            into explainable, personalized insight. Deterministic analytics do
            the math; a small set of agents explain <em className="text-text">why</em> a
            moment mattered — and a verification layer refuses to publish
            anything that cannot be grounded in the facts.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup"><Button size="lg">Create account</Button></Link>
            <Link href="/login"><Button size="lg" variant="secondary">Sign in</Button></Link>
          </div>
        </div>

        <dl className="mt-20 grid gap-6 border-t border-border pt-10 sm:grid-cols-3">
          {[
            ["Five-stage pipeline", "INGEST → INTERPRET → EXPLAIN → RENDER → PERSONALIZE"],
            ["Agents where it counts", "Orchestrator, Match Intelligence, Narrative, Personalization, Verification"],
            ["Deterministic simulation", "Seeded. Replayable. Five scenarios. No invented stats."],
          ].map(([title, body]) => (
            <div key={title}>
              <dt className="text-sm font-medium text-text">{title}</dt>
              <dd className="mt-1 text-sm text-text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
