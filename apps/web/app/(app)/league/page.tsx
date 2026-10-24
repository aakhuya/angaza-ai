import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getTeams } from "@/features/settings/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LeaguePage() {
  const teams = await getTeams();

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">League</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">AngazaBol Premier League</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Eight fictional clubs. Match scenarios pair two of them at a time;
          the rest appear in the league table for reference.
        </p>
      </header>

      {teams.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-text-muted">
              The league data could not be loaded. Ensure the API is running.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((t) => (
            <Card key={t.name}>
              <CardHeader>
                <span className="text-sm font-medium">{t.name}</span>
                <Badge tone="accent">{t.short_name}</Badge>
              </CardHeader>
              <CardBody className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-text-faint">
                  {t.nickname}
                </div>
                <p className="text-sm text-text-muted">{t.identity}</p>
                <div className="mt-3 font-mono text-2xs text-text-faint">
                  {t.players.length} players
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
