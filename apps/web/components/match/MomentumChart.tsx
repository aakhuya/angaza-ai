"use client";

import { useId, useMemo } from "react";

import type { MomentumPoint } from "@/types/api";

export function MomentumChart({
  points, homeLabel, awayLabel,
}: { points: MomentumPoint[]; homeLabel: string; awayLabel: string }) {
  const titleId = useId();
  const descId = useId();

  const { width, height, path, max } = useMemo(() => {
    const w = 640;
    const h = 120;
    const maxV = Math.max(1, ...points.flatMap((p) => [p.home, p.away]));
    const step = points.length > 1 ? w / (points.length - 1) : w;
    const y = (v: number) => h - (v / maxV) * (h - 8) - 4;
    const p = points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${y(pt.home).toFixed(1)}`)
      .join(" ");
    return { width: w, height: h, path: p, max: maxV };
  }, [points]);

  if (points.length === 0) {
    return <div className="text-sm text-text-muted">No momentum data yet.</div>;
  }

  const last = points[points.length - 1];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-2xs uppercase tracking-wider text-text-faint">
        <span className="truncate">{homeLabel}</span>
        <span className="hidden sm:inline">max bucket {max.toFixed(1)}</span>
        <span className="truncate text-right">{awayLabel}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        preserveAspectRatio="none"
      >
        <title id={titleId}>Momentum over time</title>
        <desc id={descId}>
          Home momentum ends at {last.home.toFixed(1)} and away momentum ends at{" "}
          {last.away.toFixed(1)}. Peak bucket value is {max.toFixed(1)}.
        </desc>
        <defs>
          <linearGradient id="momentum" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#E8A33D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E8A33D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="url(#momentum)" />
        <path d={path} fill="none" stroke="#E8A33D" strokeWidth="1.5" />
        <line x1="0" y1={height - 4} x2={width} y2={height - 4} stroke="#22262B" strokeWidth="1" />
      </svg>
    </div>
  );
}
