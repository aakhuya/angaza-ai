import "server-only";

import { apiServer } from "@/lib/api.server";
import type { Preferences, Profile } from "@/types/api";

export function getProfile() {
  return apiServer.get<Profile>("/profile");
}
export function getPreferences() {
  return apiServer.get<Preferences>("/preferences");
}
