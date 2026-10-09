"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { openMatchStream } from "@/lib/sse";
import type { Insight, MatchState, Scenario, ViewerMode } from "@/types/api";

type Status = "idle" | "connecting" | "live" | "paused" | "finished" | "error";

export type UseMatchStream = {
  state: MatchState | null;
  insights: Insight[];
  status: Status;
  error: string | null;
};

export function useMatchStream(
  matchId: string,
  opts: { scenario: Scenario; seed: number; viewerMode: ViewerMode; autoStart?: boolean },
): UseMatchStream {
  const [state, setState] = useState<MatchState | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const start = useCallback(async () => {
    const url = `/matches/${encodeURIComponent(matchId)}/start` +
      `?seed=${opts.seed}&scenario=${opts.scenario}&viewer_mode=${opts.viewerMode}&speed=600`;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const res = await fetch(`${base}${url}`, { method: "POST", credentials: "include" });
    if (!res.ok && res.status !== 409) {
      // 409 means already running — treat as success.
      throw new Error(`Failed to start match (${res.status})`);
    }
  }, [matchId, opts.scenario, opts.seed, opts.viewerMode]);

  useEffect(() => {
    setStatus("connecting");
    setInsights([]);
    setError(null);

    const close = openMatchStream(matchId, ({ type, data }) => {
      if (type === "status") {
        const s = (data as { status: Status }).status;
        setStatus(s);
      } else if (type === "state") {
        setState((data as { state: MatchState }).state);
      } else if (type === "insight") {
        const insight = data as Insight;
        setInsights((prev) => {
          if (prev.some((i) => i.insight_id === insight.insight_id)) return prev;
          return [...prev, insight].sort((a, b) => a.minute * 60 + a.second - (b.minute * 60 + b.second));
        });
      } else if (type === "event") {
        // Reserved for fine-grained timeline if needed later.
      }
    });

    if (opts.autoStart !== false && !startedRef.current) {
      startedRef.current = true;
      start().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to start");
        setStatus("error");
      });
    }

    return () => close();
  }, [matchId, opts.autoStart, opts.scenario, opts.seed, opts.viewerMode, start]);

  return { state, insights, status, error };
}
