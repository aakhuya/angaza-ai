import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Insight } from "@/types/api";

export function InsightFeed({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <EmptyState
        title="Waiting for the first moment"
        description="Important events will appear here as the match runs. The pipeline only publishes insights that pass verification."
      />
    );
  }
  return (
    <ul className="space-y-3">
      {[...insights].reverse().map((i) => (
        <li key={i.insight_id} className="animate-slide-up rounded-md border border-border bg-bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xs tabular-nums text-text-faint">
                {String(i.minute).padStart(2, "0")}:{String(i.second).padStart(2, "0")}
              </span>
              <Badge>{i.category.replace("_", " ")}</Badge>
            </div>
            <span className="font-mono text-2xs text-text-faint">
              {(i.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="mt-2 text-sm font-medium">{i.title}</p>
          <p className="mt-1 text-sm text-text-muted">{i.body}</p>
        </li>
      ))}
    </ul>
  );
}
