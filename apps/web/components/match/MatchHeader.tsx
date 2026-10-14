import { Badge } from "@/components/ui/Badge";

export function MatchHeader({
  homeName,
  awayName,
  homeScore,
  awayScore,
  minute,
  second,
  status,
}: {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  second: number;
  status: string;
}) {
  const tone = status === "live" ? "accent" : status === "finished" ? "teal" : "neutral";

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
        Three-column grid with min-widths. This is what fixes the Samsung A55
        wrapping problem: the score cell cannot shrink below its content, and
        each team cell truncates rather than wraps. Names never drop to the
        next line and appear to belong to the wrong team.
      */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-5">
        <TeamCell name={homeName} side="home" />

        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-3xl leading-none sm:text-4xl">{homeScore}</span>
            <span className="text-2xl leading-none text-text-faint sm:text-3xl">–</span>
            <span className="text-3xl leading-none sm:text-4xl">{awayScore}</span>
          </div>
        </div>

        <TeamCell name={awayName} side="away" />
      </div>
    </div>
  );
}

function TeamCell({ name, side }: { name: string; side: "home" | "away" }) {
  const short = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={[
        "flex min-w-0 flex-col gap-2",
        side === "home" ? "items-start" : "items-end",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full font-mono text-[0.7rem] font-semibold text-bg",
          side === "home" ? "bg-accent" : "bg-teal",
        ].join(" ")}
        aria-hidden
      >
        {short}
      </span>
      {/* Truncate rather than wrap. `whitespace-nowrap` + `truncate` means
          the name always stays on one line, even at 320px width. */}
      <span
        className={[
          "max-w-full truncate whitespace-nowrap text-sm font-medium",
          side === "home" ? "text-left" : "text-right",
        ].join(" ")}
        title={name}
      >
        {name}
      </span>
    </div>
  );
}
