"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { login, signup } from "@/lib/auth.client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const displayName = String(data.get("display_name") ?? "").trim();

    try {
      if (mode === "signup") {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Angaza AI</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        {mode === "login"
          ? "Access your match intelligence dashboard."
          : "Set up your personalized match intelligence experience."}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {mode === "signup" && (
          <Input
            label="Display name"
            name="display_name"
            autoComplete="name"
            defaultValue=""
          />
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue=""
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          defaultValue=""
        />

        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger-soft bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-muted">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link className="text-accent hover:underline" href="/signup">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link className="text-accent hover:underline" href="/login">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
