"use client";

import type { ViewerMode } from "@/types/api";

const MODES: Array<{ id: ViewerMode; label: string }> = [
  { id: "casual", label: "Casual" },
  { id: "analyst", label: "Analyst" },
  { id: "player_focus", label: "Player focus" },
];

export function ViewerModeSwitcher({
  value, onChange, disabled,
}: { value: ViewerMode; onChange: (m: ViewerMode) => void; disabled?: boolean }) {
  return (
    <div
      role="group"
      aria-label="Viewer mode"
      className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-bg-surface p-0.5"
    >
      {MODES.map((m) => {
        const active = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={[
              "rounded px-3 py-2 text-xs font-medium transition-colors focus-ring disabled:opacity-50 sm:py-1.5",
              active ? "bg-bg-elevated text-text" : "text-text-muted hover:text-text",
            ].join(" ")}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
