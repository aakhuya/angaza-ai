"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

/**
 * /demo — one-click demo login. Creates a throwaway account via /auth/demo,
 * then redirects to /matches/balanced.
 *
 * This page exists so a judge can be dropped into the product from any
 * "Try the demo" link, without a form or an API call from their end.
 */
export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/auth/demo", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Demo login failed (${res.status})`);
        }
        if (cancelled) return;
        router.refresh();
        router.push("/matches/balanced");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not start the demo.");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-sm text-center">
        {error ? (
          <>
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-danger">
              Demo unavailable
            </p>
            <h1 className="mt-2 text-xl font-semibold">Could not start the demo</h1>
            <p className="mt-2 text-sm text-text-muted">{error}</p>
            <p className="mt-6 text-sm">
              <a href="/login" className="text-accent hover:underline">
                Sign in with an account
              </a>
            </p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" />
            <p className="mt-4 text-sm text-text-muted">Starting your demo…</p>
          </>
        )}
      </div>
    </div>
  );
}
