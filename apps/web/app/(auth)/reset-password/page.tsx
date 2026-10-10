"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/password/reset", { token, new_password: password });
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reset link missing</h1>
        <p className="mt-2 text-sm text-text-muted">
          This page requires a valid reset token. Request a new link from the login page.
        </p>
        <p className="mt-6 text-sm text-text-muted">
          <Link href="/forgot-password" className="text-accent hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
      <p className="mt-1 text-sm text-text-muted">Choose a password that meets the requirements.</p>

      {done ? (
        <div className="mt-6 rounded-md border border-teal-soft bg-teal/10 px-3 py-3 text-sm text-teal">
          Password updated. Redirecting to sign in…
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <PasswordField value={password} onChange={setPassword} label="New password" />
          <PasswordField value={confirm} onChange={setConfirm} showRequirements={false} label="Confirm new password" />
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Update password
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-text-muted">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}
