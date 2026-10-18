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
        Three-column grid with explicit min widths.
        - Column 1 (home team) flexes from 0 but can grow.
        - Column 2 (score) is auto-width — cannot shrink.
        - Column 3 (away team) mirrors column 1.
        Team names use `truncate whitespace-nowrap` so they show ellipsis
        rather than wrap. This is the fix for the Samsung A55 wrap issue:
        a long name like "Mwangaza United" never breaks to a second line,
        and therefore never looks like a sub-label of the other team.
      */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-5">
        <TeamCell name={homeName} monogram={homeMonogram} side="home" />

        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-3xl leading-none sm:text-4xl">{homeScore}</span>
            <span className="text-2xl leading-none text-text-faint sm:text-3xl">–</span>
            <span className="text-3xl leading-none sm:text-4xl">{awayScore}</span>
          </div>
        </div>

        <TeamCell name={awayName} monogram={awayMonogram} side="away" />
      </div>
    </div>
  );
}

function TeamCell({
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
        "flex min-w-0 items-center gap-2.5",
        side === "home" ? "flex-row" : "flex-row-reverse",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[0.7rem] font-semibold text-bg",
          side === "home" ? "bg-accent" : "bg-teal",
        ].join(" ")}
        aria-hidden
      >
        {short}
      </span>
      <span
        className={[
          "min-w-0 truncate whitespace-nowrap text-sm font-medium",
          side === "home" ? "text-left" : "text-right",
        ].join(" ")}
        title={name}
      >
        {name}
      </span>
    </div>
  );
}
