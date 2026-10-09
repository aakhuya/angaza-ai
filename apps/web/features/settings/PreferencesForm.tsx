"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { patchPreferences } from "./client";
import type { Preferences } from "@/types/api";

const MODES: Array<{ id: Preferences["viewer_mode"]; label: string; blurb: string }> = [
  { id: "casual", label: "Casual", blurb: "Short, energetic, plain language." },
  { id: "analyst", label: "Analyst", blurb: "Precise, tactical, metric-led." },
  { id: "player_focus", label: "Player focus", blurb: "Centred on a specific player's contribution." },
];

const DETAILS: Array<Preferences["explanation_detail"]> = ["brief", "standard", "deep"];

export function PreferencesForm({ initial }: { initial: Preferences }) {
  const [form, setForm] = useState<Preferences>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const next = await patchPreferences(form);
      setForm(next);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset>
        <legend className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Viewer mode
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {MODES.map((m) => {
            const active = form.viewer_mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setForm({ ...form, viewer_mode: m.id })}
                className={[
                  "rounded-md border px-3 py-3 text-left transition-colors focus-ring",
                  active ? "border-accent bg-accent/10" : "border-border bg-bg-surface hover:border-border-strong",
                ].join(" ")}
              >
                <div className="text-sm font-medium">{m.label}</div>
                <div className="mt-1 text-xs text-text-muted">{m.blurb}</div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Explanation detail
        </legend>
        <div className="mt-3 inline-flex rounded-md border border-border bg-bg-surface p-0.5">
          {DETAILS.map((d) => {
            const active = form.explanation_detail === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setForm({ ...form, explanation_detail: d })}
                className={[
                  "rounded px-3 py-1.5 text-xs font-medium capitalize focus-ring",
                  active ? "bg-bg-elevated text-text" : "text-text-muted hover:text-text",
                ].join(" ")}
              >
                {d}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "saving"}>Save preferences</Button>
        {status === "saved" && <span className="text-xs text-teal">Saved.</span>}
        {status === "error" && <span className="text-xs text-danger">Save failed.</span>}
      </div>
    </form>
  );
}
