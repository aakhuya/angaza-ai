import { notFound } from "next/navigation";

import { SCENARIOS } from "@/features/matches/scenarios";
import { getPreferences } from "@/features/settings/server";
import type { Scenario, ViewerMode } from "@/types/api";

import { LiveMatchView } from "./LiveMatchView";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario } = await params;
  const meta = SCENARIOS.find((s) => s.id === scenario);
  if (!meta) notFound();

  const prefs = await getPreferences().catch(() => null);
  const viewerMode: ViewerMode = (prefs?.viewer_mode as ViewerMode) ?? "analyst";

  return <LiveMatchView scenario={meta.id as Scenario} initialViewerMode={viewerMode} seed={42} />;
}
