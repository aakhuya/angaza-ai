import { api } from "@/lib/api";
import type { Preferences, Profile } from "@/types/api";

export function getProfile() {
  return api.get<Profile>("/profile");
}

export function patchProfile(body: Partial<Profile>) {
  return api.patch<Profile>("/profile", body);
}

export function getPreferences() {
  return api.get<Preferences>("/preferences");
}

export function patchPreferences(body: Partial<Preferences>) {
  return api.patch<Preferences>("/preferences", body);
}

export async function uploadAvatar(file: File): Promise<Profile> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/profile/avatar", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body?.detail === "string" ? body.detail : "Upload failed",
    );
  }
  return res.json();
}

export type ClubOption = {
  name: string;
  short_name: string;
  nickname: string;
  identity: string;
  color: string;
  players: Array<{ id: string; name: string; position: string; number: number }>;
};

export async function getTeams(): Promise<ClubOption[]> {
  try {
    const res = await api.get<{ teams: ClubOption[] }>("/league/teams");
    return res.teams;
  } catch {
    return [];
  }
}
