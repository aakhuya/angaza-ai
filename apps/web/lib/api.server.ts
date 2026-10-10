import "server-only";

import { cookies } from "next/headers";

import { api, type FetchOptions } from "./api";

export async function serverFetchOptions(): Promise<FetchOptions> {
  const store = await cookies();
  const all = store.getAll();
  if (all.length === 0) return {};
  return { cookieHeader: all.map((c) => `${c.name}=${c.value}`).join("; ") };
}

export const apiServer = {
  async get<T>(path: string): Promise<T> {
    return api.get<T>(path, await serverFetchOptions());
  },
  async post<T>(path: string, body?: unknown): Promise<T> {
    return api.post<T>(path, body, await serverFetchOptions());
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    return api.patch<T>(path, body, await serverFetchOptions());
  },
};
