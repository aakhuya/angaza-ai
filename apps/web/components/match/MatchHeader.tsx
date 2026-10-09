import { Badge } from "@/components/ui/Badge";

export function MatchHeader({
  homeName, awayName, homeScore, awayScore, minute, second, status,
}: {
  homeName: string; awayName: string;
  homeScore: number; awayScore: number;
  minute: number; second: number;
  status: string;
}) {
  const tone = status === "live" ? "accent" : status === "finished" ? "teal" : "neutral";
  return (
    <div className="rounded-lg border border-border bg-bg-surface">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center justify-between gap-4 sm:justify-start">
          <div className="text-right sm:text-left">
            <div className="text-2xs uppercase tracking-wider text-text-faint">Home</div>
            <div className="text-base font-medium">{homeName}</div>
          </div>
          <div className="flex items-center gap-3 font-mono text-3xl tabular-nums">
            <span>{homeScore}</span>
            <span className="text-text-faint">–</span>
            <span>{awayScore}</span>
          </div>
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-faint">Away</div>
            <div className="text-base font-medium">{awayName}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="font-mono text-sm tabular-nums text-text-muted">
            {String(minute).padStart(2, "0")}:{String(second).padStart(2, "0")}
          </span>
          <Badge tone={tone}>{status.toUpperCase()}</Badge>
        </div>
      </div>
    </div>
  );
}
