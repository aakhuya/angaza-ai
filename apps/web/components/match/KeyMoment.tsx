import { Badge } from "@/components/ui/Badge";
import type { Insight } from "@/types/api";

export function KeyMoment({ insight }: { insight: Insight }) {
  const time = `${String(insight.minute).padStart(2, "0")}:${String(insight.second).padStart(2, "0")}`;
  return (
    <div className="animate-slide-up rounded-lg border border-accent-soft bg-accent/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-accent">{time}</span>
          <Badge tone="accent">{insight.category.replace("_", " ")}</Badge>
        </div>
        <span className="font-mono text-2xs text-text-faint">
          confidence {(insight.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <h2 className="mt-3 text-lg font-medium tracking-tight">{insight.title}</h2>
      <p className="mt-2 text-sm text-text-muted">{insight.body}</p>
      {insight.supporting_event_ids.length > 0 && (
        <p className="mt-3 truncate font-mono text-2xs text-text-faint">
          source: {insight.supporting_event_ids.join(", ")}
        </p>
      )}
    </div>
  );
}
