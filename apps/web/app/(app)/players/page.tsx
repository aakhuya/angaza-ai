import { EmptyState } from "@/components/ui/EmptyState";
export default function PlayersIndex() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Players</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Player intelligence</h1>
        <p className="mt-1 text-sm text-text-muted">
          Open a match analysis, then click a standout player to see their involvement.
        </p>
      </div>
      <EmptyState title="Select a match first" description="Player detail pages are reached from /matches/[scenario]/analysis." />
    </div>
  );
}
