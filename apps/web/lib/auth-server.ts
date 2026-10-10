import "server-only";

import { cache } from "react";

import { serverApi } from "./api-server";
import type { User } from "@/types/api";

/**
 * Server-side only. Memoized per request via React `cache`.
 * Returns null on 401 so layouts can branch cleanly.
 */
export const getMe = cache(async (): Promise<User | null> => {
  try {
    return await serverApi.get<User>("/auth/me");
  } catch {
    return null;
  }
});
