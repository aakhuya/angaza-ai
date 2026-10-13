"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/matches?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-black/85 px-4 backdrop-blur sm:px-6">
      <form onSubmit={onSubmit} className="relative flex-1 max-w-md">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" fill="none" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search matches, teams, players…"
          aria-label="Search"
          className="h-9 w-full rounded-md border border-border bg-bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-2 text-text-muted hover:text-text focus-ring"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              d="M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3z M10 20a2 2 0 0 0 4 0"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
