import "server-only";

import { serverApi } from "@/lib/api-server";
import type { Preferences, Profile } from "@/types/api";

export function getProfile() { return serverApi.get<Profile>("/profile"); }
export function getPreferences() { return serverApi.get<Preferences>("/preferences"); }
