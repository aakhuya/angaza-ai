import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SCENARIOS } from "@/features/matches/scenarios";

export default function MatchesPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Matches</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Choose a scenario</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Each scenario is a deterministic synthetic match. The same seed always
          reproduces the same event stream, which is what makes the intelligence
          explainable and testable.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => (
          <Link key={s.id} href={`/matches/${s.id}`} className="group focus-ring rounded-lg">
            <Card className="h-full transition-colors group-hover:border-border-strong">
              <CardHeader>
                <span className="text-sm font-medium">{s.label}</span>
                <Badge tone="teal" title="Deterministic replay — same seed produces the same match every run">reproducible</Badge>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-text-muted">{s.blurb}</p>
                <p className="mt-3 font-mono text-2xs text-text-faint" title="Deterministic replay — same seed reproduces the same match">
                  scenario = {s.id} · seed = 42
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
