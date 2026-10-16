import Link from "next/link";
import { Radio } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SCENARIOS } from "@/features/matches/scenarios";

/**
 * "Live now" — every scenario the simulator can stream is available to start
 * or join. This page is honest: it does not claim any match is running unless
 * the user opens it. Deterministic simulation means "starting" is instant.
 */
export default function LiveIndexPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-live-red">
          Live now
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Start or join a match</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Every scenario below is a synthetic match you can run in real time.
          Insights stream as the match progresses; you can switch viewer mode
          at any point.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <CardHeader>
              <span className="text-sm font-medium capitalize">{s.label}</span>
              <Badge tone="danger">Ready</Badge>
            </CardHeader>
            <CardBody className="flex flex-1 flex-col gap-3">
              <p className="text-xs leading-relaxed text-text-muted">{s.blurb}</p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <Link href={`/matches/${s.id}`}>
                  <Button size="sm">
                    <Radio size={13} strokeWidth={1.75} /> Start match
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Currently streaming</span>
        </CardHeader>
        <CardBody>
          <EmptyState
            title="No match is running right now"
            description="Start one of the scenarios above — the stream begins immediately and insights appear as the match progresses."
          />
        </CardBody>
      </Card>
    </div>
  );
}
