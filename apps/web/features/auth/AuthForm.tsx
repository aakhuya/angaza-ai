"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { login, signup } from "@/lib/auth";
import type { PasswordReport } from "@/lib/password";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    return undefined;
  }, [email, touched.email]);

  const confirmError = useMemo(() => {
    if (mode !== "signup" || !touched.confirm) return undefined;
    if (!confirm) return "Confirm your password.";
    if (confirm !== password) return "Passwords do not match.";
    return undefined;
  }, [confirm, password, mode, touched.confirm]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTopError(null);
    setTouched({ email: true, password: true, confirm: true });

    if (mode === "signup") {
      if (password !== confirm) return;
      const report = await safeCheck(password);
      if (report && !report.valid) {
        setTopError("Please choose a stronger password that meets the requirements.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") await signup(email, password, displayName);
      else await login(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setTopError(err.status === 401 ? "Incorrect email or password." : err.message);
      } else {
        setTopError("Unexpected error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "login" ? "Welcome Back" : "Create Your Account"}
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        {mode === "login"
          ? "Sign in to continue."
          : "Join the platform and start exploring football intelligence."}
      </p>

      <div className="mt-6">
        <OAuthButtons />
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" aria-hidden />
          <span className="text-2xs uppercase tracking-wider text-text-faint">or</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {mode === "signup" && (
          <Input
            label="Full name"
            name="display_name"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ada Lovelace"
          />
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
          placeholder="you@example.com"
        />

        {mode === "signup" ? (
          <>
            <PasswordField value={password} onChange={setPassword} autoComplete="new-password" label="Password" />
            <PasswordField value={confirm} onChange={setConfirm} autoComplete="new-password" showRequirements={false} label="Confirm Password" />
            {confirmError && <p className="text-xs text-danger" role="alert">{confirmError}</p>}
          </>
        ) : (
          <PasswordField value={password} onChange={setPassword} autoComplete="current-password" showRequirements={false} label="Password" />
        )}

        <div className="flex items-center justify-between">
          {mode === "login" ? (
            <>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border bg-bg-surface accent-accent"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </>
          ) : (
            <p className="text-xs text-text-faint">
              By creating an account you agree to use this demo responsibly.
            </p>
          )}
        </div>

        {topError && (
          <div role="alert" className="rounded-md border border-danger-soft bg-danger/10 px-3 py-2 text-sm text-danger">
            {topError}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {mode === "login" ? "Sign in" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-muted">
        {mode === "login" ? (
          <>Don&apos;t have an account? <Link className="text-accent hover:underline" href="/signup">Sign up</Link></>
        ) : (
          <>Already have an account? <Link className="text-accent hover:underline" href="/login">Log in</Link></>
        )}
      </p>
    </div>
  );
}

async function safeCheck(password: string): Promise<PasswordReport | null> {
  try {
    const { checkPassword } = await import("@/lib/password");
    return await checkPassword(password);
  } catch {
    return null;
  }
}
