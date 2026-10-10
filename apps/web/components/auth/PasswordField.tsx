"use client";

import { useEffect, useId, useState } from "react";

import type { PasswordReport } from "@/lib/password";

const RULE_LABELS: Array<[keyof PasswordReport["rules"], string]> = [
  ["length", "At least 8 characters"],
  ["lower", "One lowercase letter"],
  ["upper", "One uppercase letter"],
  ["digit", "One number"],
  ["symbol", "One symbol"],
];

export function PasswordField({
  value, onChange, autoComplete = "new-password", showRequirements = true, label = "Password",
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  showRequirements?: boolean;
  label?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [report, setReport] = useState<PasswordReport | null>(null);

  useEffect(() => {
    if (!showRequirements) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!value) {
        if (!cancelled) setReport(null);
        return;
      }
      try {
        const { checkPassword } = await import("@/lib/password");
        const r = await checkPassword(value);
        if (!cancelled) setReport(r);
      } catch {
        if (!cancelled) setReport(null);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value, showRequirements]);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-bg-surface pl-3 pr-20 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-describedby={showRequirements ? `${id}-rules` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded px-2.5 py-1.5 text-2xs font-medium uppercase tracking-wider text-text-muted hover:text-text focus-ring"
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {showRequirements && (
        <ul id={`${id}-rules`} className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2" aria-live="polite">
          {RULE_LABELS.map(([key, label]) => {
            const ok = report?.rules[key] ?? false;
            const touched = !!value;
            return (
              <li
                key={key}
                className={[
                  "flex items-center gap-1.5 text-xs",
                  !touched ? "text-text-faint" : ok ? "text-success" : "text-text-muted",
                ].join(" ")}
              >
                <RuleDot state={!touched ? "idle" : ok ? "ok" : "pending"} />
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RuleDot({ state }: { state: "idle" | "ok" | "pending" }) {
  const color =
    state === "ok" ? "bg-success" : state === "pending" ? "bg-text-faint" : "bg-border";
  return (
    <span
      aria-hidden
      className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${color}`}
    />
  );
}
