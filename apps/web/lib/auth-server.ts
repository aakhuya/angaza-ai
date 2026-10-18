import "server-only";

import { serverApi } from "./api-server";
import type { User } from "@/types/api";

/**
 * Resolve the currently authenticated user from a Server Component.
 *
 * Reads HttpOnly cookies via next/headers and calls GET /auth/me through the
 * backend. Returns null if the user is not authenticated or the API is
 * unreachable — callers should redirect, not throw.
 *
 * This module cannot be imported from a Client Component. Use the login/
 * signup/logout helpers in lib/auth.ts for client-side flows, and receive
 * the user via props from a Server Component.
 */
export async function getMe(): Promise<User | null> {
  try {
    return await serverApi.get<User>("/auth/me");
  } catch {
    return null;
  }
}
