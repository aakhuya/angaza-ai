import type { MatchState } from "@/types/api";

const ROWS: Array<[string, (s: MatchState) => [string | number, string | number]]> = [
  ["Possession %", (s) => [s.home.possession_pct.toFixed(0), s.away.possession_pct.toFixed(0)]],
  ["Pass accuracy", (s) => [`${s.home.pass_accuracy.toFixed(0)}%`, `${s.away.pass_accuracy.toFixed(0)}%`]],
  ["Progressive passes", (s) => [s.home.progressive_passes, s.away.progressive_passes]],
  ["Final-third entries", (s) => [s.home.final_third_entries, s.away.final_third_entries]],
  ["Shots (on target)", (s) => [`${s.home.shots} (${s.home.shots_on_target})`, `${s.away.shots} (${s.away.shots_on_target})`]],
  ["Pressures", (s) => [s.home.pressures, s.away.pressures]],
  ["Interceptions", (s) => [s.home.interceptions, s.away.interceptions]],
  ["Recoveries", (s) => [s.home.possession_recoveries, s.away.possession_recoveries]],
];

export function StatGrid({ state }: { state: MatchState }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center bg-bg-elevated px-4 py-2.5 text-2xs uppercase tracking-wider text-text-faint">
        <span className="truncate">{state.home.team_id}</span>
        <span className="px-3 text-center">Stat</span>
        <span className="truncate text-right">{state.away.team_id}</span>
      </div>
      <div className="divide-y divide-border bg-bg-surface">
        {ROWS.map(([label, fn]) => {
          const [h, a] = fn(state);
          return (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 py-2.5"
            >
              <span className="truncate font-mono text-sm tabular-nums">{h}</span>
              <span className="whitespace-nowrap px-3 text-center text-xs text-text-muted">{label}</span>
              <span className="truncate text-right font-mono text-sm tabular-nums">{a}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
