const FEATURES = [
  {
    title: "Live Match Intelligence",
    body: "Real-time insights & analysis as the match unfolds.",
    icon: "pulse",
  },
  {
    title: "AI-Powered Explanations",
    body: "Understand why each moment matters, not just what happened.",
    icon: "spark",
  },
  {
    title: "Personalized Experience",
    body: "Tailored to casual fans, analysts, and player-focused viewers.",
    icon: "user",
  },
  {
    title: "Automated Match Recaps",
    body: "Grounded recaps generated from validated match state.",
    icon: "doc",
  },
  {
    title: "Synthetic Simulation",
    body: "Deterministic, seeded matches. Reproducible every run.",
    icon: "grid",
  },
];

export function FeatureStrip() {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
      {FEATURES.map((f) => (
        <div key={f.title} className="flex items-start gap-3 bg-bg-surface p-4">
          <FeatureIcon name={f.icon} />
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-text">{f.title}</div>
            <div className="mt-1 text-xs text-text-muted">{f.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const common = "h-4 w-4 text-accent";
  switch (name) {
    case "pulse":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <path d="M10 12h6M10 16h6M10 8h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <path d="M4 4h16v16H4z M4 12h16 M12 4v16" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}
