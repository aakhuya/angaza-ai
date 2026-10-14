"use client";

import { Bell, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Insight } from "@/types/api";

type NotificationEntry = {
  id: string;
  title: string;
  body: string;
  minute: number;
  category: string;
  matchId: string;
  read: boolean;
};

/**
 * Reads from the same /matches/{id}/insights endpoint the live page uses.
 * The list is bounded — we only keep recent items. Marking as read is
 * local to the session (no backend write) which is honest for a demo.
 */
export function Notifications({ matchId = "balanced-42-analyst" }: { matchId?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationEntry[]>([]);
  const [unread, setUnread] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch on open. Poll every 15 s while open so new insights appear.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/matches/${encodeURIComponent(matchId)}/insights`,
          { credentials: "include" },
        );
        if (!res.ok) return;
        const body = (await res.json()) as { insights: Insight[] };
        if (cancelled) return;
        const next = body.insights
          .slice(-12)
          .reverse()
          .map((i) => ({
            id: i.insight_id,
            title: i.title,
            body: i.body,
            minute: i.minute,
            category: i.category,
            matchId: i.match_id,
            read: false,
          }));
        setItems(next);
        setUnread((prev) => (prev === 0 && next.length > 0 ? next.length : prev));
      } catch {
        // Silent — the panel shows its own empty state.
      }
    }
    load();
    const t = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [open, matchId]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function toggle() {
    setOpen((v) => !v);
    if (!open) setUnread(0);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `${unread} unread insights` : "Notifications"}
        aria-expanded={open}
        className="relative rounded-md p-2 text-text-muted hover:text-text focus-ring"
      >
        <Bell size={16} strokeWidth={1.75} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Recent insights"
          className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-bg-surface shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium">Recent insights</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="rounded p-1 text-text-faint hover:text-text focus-ring"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-text-muted">
              No insights yet. Start a match from{" "}
              <Link href="/matches" className="text-accent hover:underline">
                Matches
              </Link>{" "}
              to see them here.
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/matches/balanced`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-bg-elevated"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xs tabular-nums text-text-faint">
                        {String(n.minute).padStart(2, "0")}&apos;
                      </span>
                      <span className="text-2xs uppercase tracking-wider text-accent">
                        {n.category.replace("_", " ")}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{n.title}</div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">
                      {n.body}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
