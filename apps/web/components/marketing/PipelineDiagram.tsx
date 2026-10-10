const STAGES = [
  { id: "ingest", label: "Ingest", body: "Synthetic events arrive, schema-validated." },
  { id: "interpret", label: "Interpret", body: "Deterministic analytics compute stats." },
  { id: "explain", label: "Explain", body: "Agents reason over validated facts." },
  { id: "render", label: "Render", body: "Insights, feeds, and visualizations." },
  { id: "personalize", label: "Personalize", body: "Tone and depth per viewer mode." },
];

export function PipelineDiagram() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {STAGES.map((s, i) => (
        <li key={s.id} className="relative rounded-lg border border-border bg-bg-surface p-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xs text-accent">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm font-medium">{s.label}</span>
          </div>
          <p className="mt-2 text-xs text-text-muted">{s.body}</p>
          {i < STAGES.length - 1 && (
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 items-center justify-center text-text-faint lg:flex"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
