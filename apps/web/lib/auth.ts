import { api } from "./api";
import type { User } from "@/types/api";

export async function getMe(): Promise<User | null> {
  try {
    return await api.get<User>("/auth/me");
  } catch {
    return null;
  }
}

export async function signup(email: string, password: string, display_name = ""): Promise<User> {
  return api.post<User>("/auth/signup", { email, password, display_name });
}

export async function login(email: string, password: string): Promise<User> {
  return api.post<User>("/auth/login", { email, password });
}

export async function logout(): Promise<void> {
  await api.post<void>("/auth/logout");
}
