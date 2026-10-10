import "server-only";

import { cookies } from "next/headers";

import { apiRequest, type RequestOptions } from "./api";

async function withCookies<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const jar = await cookies();
  const incoming = jar.toString();
  return apiRequest<T>(path, { ...opts, cookieHeader: incoming || null });
}

export const serverApi = {
  get: <T,>(path: string) => withCookies<T>(path),
  post: <T,>(path: string, body?: unknown) =>
    withCookies<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T,>(path: string, body: unknown) =>
    withCookies<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
