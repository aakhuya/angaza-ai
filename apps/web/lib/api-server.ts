import { cookies } from "next/headers";

import { API_BASE_URL, ApiError } from "./api";

/**
 * Server-component fetch helper.
 *
 * Next.js server components do not automatically forward the incoming request's
 * cookies to outbound fetches. We forward them explicitly so authenticated
 * routes on the backend see the same session that the browser sent us.
 *
 * Do NOT use this in client components — the browser's fetch already carries
 * credentials via `credentials: "include"`.
 */
export async function serverFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const parsed: unknown = text ? safeJson(text) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(parsed, res.status), parsed);
  }

  return parsed as T;
}

export const serverApi = {
  get: <T,>(path: string) => serverFetch<T>(path),
  post: <T,>(path: string, body?: unknown) =>
    serverFetch<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T,>(path: string, body: unknown) =>
    serverFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

function extractMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const detail = (body as Record<string, unknown>).detail;
    if (typeof detail === "string" && detail.length > 0) return detail;
  }
  return `Request failed (${status})`;
}
