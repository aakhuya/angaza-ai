import { api } from "@/lib/api";
import type { Preferences, Profile } from "@/types/api";

export function patchProfile(body: Partial<Profile>) { return api.patch<Profile>("/profile", body); }
export function patchPreferences(body: Partial<Preferences>) {
  return api.patch<Preferences>("/preferences", body);
}
