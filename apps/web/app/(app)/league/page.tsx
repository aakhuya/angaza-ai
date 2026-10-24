import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { serverApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Club = {
  name: string;
  short_name: string;
  nickname: string;
  identity: string;
  color: string;
};

async function getTeams(): Promise<Club[]> {
  try {
    const res = await serverApi.get<{ teams: Club[] }>("/league/teams");
    return res.teams;
  } catch {
    return [];
  }
}

export default async function LeaguePage() {
  const teams = await getTeams();

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">League</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">AngazaBol Premier League</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Eight fictional clubs. Match scenarios pair two of them at a time;
          the rest are listed here for reference.
        </p>
      </header>

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
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
