export type PasswordRules = {
  length: boolean;
  lower: boolean;
  upper: boolean;
  digit: boolean;
  symbol: boolean;
};

export type PasswordReport = {
  valid: boolean;
  rules: PasswordRules;
  classes_met: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function checkPassword(password: string): Promise<PasswordReport> {
  const res = await fetch(`${API_BASE}/auth/password/check`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Password check failed");
  return res.json();
}
