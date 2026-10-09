import { HTMLAttributes } from "react";

type Tone = "neutral" | "accent" | "teal" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-border bg-bg-elevated text-text-muted",
  accent: "border-accent-soft bg-accent/10 text-accent",
  teal: "border-teal-soft bg-teal/10 text-teal",
  danger: "border-danger-soft bg-danger/10 text-danger",
};

export function Badge({
  tone = "neutral", className = "", ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider",
        tones[tone], className,
      ].join(" ")}
      {...rest}
    />
  );
}
