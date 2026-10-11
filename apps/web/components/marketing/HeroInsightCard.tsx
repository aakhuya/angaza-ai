import Link from "next/link";

/**
 * Live-insight preview that floats over the hero image. It is a static,
 * hand-authored preview of the product surface — it is not driven by real
 * data and is labelled as such.
 */
export function HeroInsightCard() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-bg-surface/95 shadow-pop backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-success" aria-hidden />
          <span className="font-mono text-2xs uppercase tracking-wider text-text-muted">
            Live insight
          </span>
        </div>
        <span className="font-mono text-2xs text-text-faint">72:14</span>
      </div>
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="rounded border border-accent-soft bg-accent/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-accent">
            Tactical shift
          </span>
          <span className="font-mono text-2xs text-text-faint">confidence 82%</span>
        </div>
        <p className="text-sm font-medium leading-snug">
          Angaza detected a sustained increase in pressure.
        </p>
        <p className="text-xs text-text-muted">
          Team A increased final-third entries while forcing three possession changes in the last four minutes.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            ["Possession", "61%"],
            ["Prog. passes", "34"],
            ["Pressures", "18"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-border bg-bg-elevated px-2.5 py-2">
              <div className="text-2xs uppercase tracking-wider text-text-faint">{label}</div>
              <div className="mt-0.5 font-mono text-sm text-text">{value}</div>
            </div>
          ))}
        </div>

        <Link
          href="/signup"
          className="block pt-1 text-xs font-medium text-accent hover:underline focus-ring rounded-md"
        >
          Explore this in the live product →
        </Link>
      </div>
    </div>
  );
}
