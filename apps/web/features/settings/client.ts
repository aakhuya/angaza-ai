import { api } from "@/lib/api";
import type { Preferences, Profile } from "@/types/api";

export function getProfile() { return api.get<Profile>("/profile"); }
export function patchProfile(body: Partial<Profile>) { return api.patch<Profile>("/profile", body); }

export function getPreferences() { return api.get<Preferences>("/preferences"); }
export function patchPreferences(body: Partial<Preferences>) {
  return api.patch<Preferences>("/preferences", body);
}
