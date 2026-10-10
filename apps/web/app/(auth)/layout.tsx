export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-border bg-bg-surface p-10 md:flex">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Angaza AI</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Illuminate Every Moment.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-text-muted">
            Explainable match intelligence. A five-stage pipeline that turns
            synthetic events into reasoning a fan, analyst, or player can act on.
          </p>
        </div>
        <div className="space-y-3 font-mono text-2xs text-text-faint">
          <div>INGEST → INTERPRET → EXPLAIN → RENDER → PERSONALIZE</div>
          <div>Mock provider is the default. No keys required to explore.</div>
        </div>
      </aside>
      <main id="main" className="flex items-center justify-center px-6 py-12 scroll-mt-16">
        <div className="w-full max-w-sm animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
