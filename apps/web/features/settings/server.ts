import { serverApi } from "@/lib/api-server";
import type { Preferences, Profile } from "@/types/api";
import type { TeamOption } from "./client";

export function getProfile() {
  return serverApi.get<Profile>("/profile");
}

export function getPreferences() {
  return serverApi.get<Preferences>("/preferences");
}

export async function getTeams(): Promise<[TeamOption, TeamOption] | null> {
  try {
    const res = await serverApi.get<{ home: TeamOption; away: TeamOption }>(
      "/scenarios/balanced/teams",
    );
    return [res.home, res.away];
  } catch (err) {
    // Log so it's visible in Vercel's runtime log.
    console.error("getTeams failed:", err);
    return null;
  }
}
