import { api } from "./api";
import type { User } from "@/types/api";

/**
 * Browser-side auth helpers.
 *
 * Every function here talks to the API via /api/* which is proxied by
 * next.config.ts. That means cookies go through the same-origin rule and
 * work with credentials: "include" (already set in lib/api.ts).
 *
 * These functions are safe to call from Client Components.
 *
 * For the current user on the server (Server Components), import from
 * lib/auth-server.ts instead.
 */

export async function signup(
  email: string,
  password: string,
  display_name = "",
): Promise<User> {
  return api.post<User>("/auth/signup", { email, password, display_name });
}

export async function login(email: string, password: string): Promise<User> {
  return api.post<User>("/auth/login", { email, password });
}

export async function logout(): Promise<void> {
  await api.post<void>("/auth/logout");
}
