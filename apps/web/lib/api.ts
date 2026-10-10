const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

type Json = Record<string, unknown>;

export type RequestOptions = RequestInit & {
  /**
   * Server-only: the value of the incoming `cookie` header to forward to the
   * API. Pass `null` (default) from client code, which relies on
   * `credentials: "include"` instead.
   */
  cookieHeader?: string | null;
};

export async function apiRequest<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const { cookieHeader, ...rest } = init;
  const method = (rest.method ?? "GET").toUpperCase();
  const hasBody = rest.body !== undefined;

  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string> | undefined),
  };
  if (hasBody && !headers["content-type"]) headers["content-type"] = "application/json";
  if (cookieHeader) headers["cookie"] = cookieHeader;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    method,
    credentials: cookieHeader ? "omit" : "include",
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
  get: <T,>(path: string, opts?: RequestOptions) => apiRequest<T>(path, opts),
  post: <T,>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, {
      ...opts,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T,>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body: JSON.stringify(body) }),
};

export const API_BASE_URL = API_BASE;
