import { Badge } from "@/components/ui/Badge";

export function MatchHeader({
  homeName,
  awayName,
  homeMonogram,
  awayMonogram,
  homeScore,
  awayScore,
  minute,
  second,
  status,
}: {
  homeName: string;
  awayName: string;
  homeMonogram?: string;
  awayMonogram?: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  second: number;
  status: string;
}) {
  const tone = status === "live" ? "danger" : status === "finished" ? "teal" : "neutral";

  return (
    <div className="rounded-lg border border-border bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="sim-badge">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-danger" aria-hidden />
            Live
          </span>
          <Badge>Simulation</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-text-muted">
            {String(minute).padStart(2, "0")}:{String(second).padStart(2, "0")}
          </span>
          <Badge tone={tone}>{status.toUpperCase()}</Badge>
        </div>
      </div>

      {/*
        Two-row layout on mobile, single row on desktop.
        This is fundamentally different from a grid because a grid column
        with a long name will force the OTHER columns to shrink or wrap.
        A flex row with `overflow: hidden` on each name cell guarantees
        single-line names — and using two rows on mobile means the names
        NEVER compete with each other for horizontal space.
      */}
      <div className="px-3 py-4 sm:px-4">
        {/* Mobile: score row + names row, stacked */}
        <div className="sm:hidden">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-2 font-mono tabular-nums">
              <span className="text-3xl leading-none">{homeScore}</span>
              <span className="text-2xl leading-none text-text-faint">–</span>
              <span className="text-3xl leading-none">{awayScore}</span>
            </div>
            <div className="flex w-full items-center justify-between gap-3 text-xs">
              <TeamRow name={homeName} monogram={homeMonogram} side="home" />
              <TeamRow name={awayName} monogram={awayMonogram} side="away" />
            </div>
          </div>
        </div>

        {/* Desktop: three-column layout */}
        <div className="hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:grid">
          <TeamRow name={homeName} monogram={homeMonogram} side="home" />
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-3xl leading-none sm:text-4xl">{homeScore}</span>
            <span className="text-2xl leading-none text-text-faint sm:text-3xl">–</span>
            <span className="text-3xl leading-none sm:text-4xl">{awayScore}</span>
          </div>
          <TeamRow name={awayName} monogram={awayMonogram} side="away" />
        </div>
      </div>
    </div>
  );
}

function TeamRow({
  name,
  monogram,
  side,
}: {
  name: string;
  monogram?: string;
  side: "home" | "away";
}) {
  const short =
    monogram ??
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  return (
    <div
      className={[
        "flex min-w-0 items-center gap-2",
        side === "home" ? "flex-row" : "flex-row-reverse",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[0.65rem] font-semibold text-bg sm:h-9 sm:w-9 sm:text-[0.7rem]",
          side === "home" ? "bg-accent" : "bg-teal",
        ].join(" ")}
        aria-hidden
      >
        {short}
      </span>
      <span
        className={[
          "team-name-nowrap text-xs font-medium sm:text-sm",
          side === "home" ? "text-left" : "text-right",
        ].join(" ")}
        title={name}
      >
        {name}
      </span>
    </div>
  );
}
