import { cookies } from "next/headers";

import { ApiError } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type FetchOptions = {
  /** Additional headers merged on top of the forwarded cookie header. */
  headers?: Record<string, string>;
  /** Cache control for the underlying fetch. Defaults to `no-store`. */
  cache?: RequestCache;
  /** Optional request signal for cancellation. */
  signal?: AbortSignal;
};

async function serverFetch<T>(
  path: string,
  init: RequestInit & FetchOptions = {},
): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: init.cache ?? "no-store",
    headers: {
      "content-type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  const body: unknown = text.length > 0 ? safeJson(text) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, extractDetail(body, res.status), body);
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractDetail(body: unknown, status: number): string {
  if (
    body !== null &&
    typeof body === "object" &&
    "detail" in body &&
    typeof (body as { detail: unknown }).detail === "string"
  ) {
    return (body as { detail: string }).detail;
  }
  return `Request failed (${status})`;
}

export const apiServer = {
  get: <T,>(path: string, opts: FetchOptions = {}) => serverFetch<T>(path, opts),
  post: <T,>(path: string, body: unknown, opts: FetchOptions = {}) =>
    serverFetch<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...opts,
    }),
  patch: <T,>(path: string, body: unknown, opts: FetchOptions = {}) =>
    serverFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...opts,
    }),
};
