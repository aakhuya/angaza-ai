import { serverApi } from "@/lib/api-server";
import type { Preferences, Profile } from "@/types/api";
import type { ClubOption } from "./client";

export function getProfile() {
  return serverApi.get<Profile>("/profile");
}

export function getPreferences() {
  return serverApi.get<Preferences>("/preferences");
}

export async function getTeams(): Promise<ClubOption[]> {
  try {
    const res = await serverApi.get<{ teams: ClubOption[] }>("/league/teams");
    return res.teams;
  } catch (err) {
    console.error("getTeams failed:", err);
    return [];
  }
}
