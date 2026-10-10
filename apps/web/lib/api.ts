const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

type Json = Record<string, unknown>;

export type FetchOptions = RequestInit & { cookieHeader?: string };

async function request<T>(path: string, init: FetchOptions = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  if (init.cookieHeader && !headers.has("cookie")) headers.set("cookie", init.cookieHeader);

  const { cookieHeader: _omit, ...rest } = init;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  const body = text ? safeJson(text) : undefined;
  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "detail" in (body as Json) && String((body as Json).detail)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, body);
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export const api = {
  get: <T,>(path: string, init?: FetchOptions) => request<T>(path, init),
  post: <T,>(path: string, body?: unknown, init?: FetchOptions) =>
    request<T>(path, { ...init, method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T,>(path: string, body: unknown, init?: FetchOptions) =>
    request<T>(path, { ...init, method: "PATCH", body: JSON.stringify(body) }),
};

export const API_BASE_URL = API_BASE;
