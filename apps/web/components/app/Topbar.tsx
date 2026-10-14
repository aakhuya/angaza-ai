"use client";

import { Bell, Search } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-bg/85 px-4 backdrop-blur sm:px-6">
      <form onSubmit={onSubmit} className="relative max-w-md flex-1">
        <Search
          size={14}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search matches, teams, players…"
          aria-label="Search"
          className="h-9 w-full rounded-md border border-border bg-bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <span className="sim-badge hidden sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
          Simulation
        </span>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-2 text-text-muted hover:text-text focus-ring"
        >
          <Bell size={16} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
