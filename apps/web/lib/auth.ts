import "server-only";

import { apiServer } from "./api.server";
import type { User } from "@/types/api";

export async function getMe(): Promise<User | null> {
  try {
    return await apiServer.get<User>("/auth/me");
  } catch {
    return null;
  }
}
