import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,520px)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-bg-surface p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 20% 10%, rgba(240,169,58,0.14), transparent 60%), radial-gradient(700px 300px at 90% 90%, rgba(79,189,176,0.10), transparent 60%)",
          }}
        />
        <div className="relative"><Logo /></div>
        <div className="relative max-w-md">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Angaza AI</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tight">
            Smarter Insights.<br />
            <span className="text-accent">Deeper Stories.</span>
          </h1>
          <p className="mt-4 text-sm text-text-muted">
            Explainable match intelligence. A five-stage pipeline that turns
            synthetic events into reasoning a fan, analyst, or player can act on.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-text-muted">
            {[
              "Deterministic analytics do the math.",
              "Agents explain why the moment mattered.",
              "Verification blocks anything it can't ground.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative font-mono text-2xs text-text-faint">
          INGEST → INTERPRET → EXPLAIN → RENDER → PERSONALIZE
        </div>
      </aside>

      <main id="main" className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 lg:px-10">
          <div className="lg:hidden"><Logo /></div>
          <Link href="/" className="ml-auto rounded-md px-2 py-1 text-xs text-text-muted hover:text-text focus-ring">
            ← Back home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-sm animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
