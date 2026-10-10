"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/password/forgot", { email });
      setSent(true);
    } catch {
      setError("Could not process the request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
      <p className="mt-1 text-sm text-text-muted">
        Enter your account email and we&apos;ll send a reset link.
      </p>

      {sent ? (
        <div className="mt-6 rounded-md border border-teal-soft bg-teal/10 px-3 py-3 text-sm text-teal">
          If an account exists for <span className="font-medium">{email}</span>, a reset link
          has been issued. In local development the link is printed to the API server logs.
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-text-muted">
        <Link href="/login" className="text-accent hover:underline">← Back to sign in</Link>
      </p>
    </div>
  );
}
