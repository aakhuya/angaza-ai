"use client";

import { API_BASE_URL } from "@/lib/api";

// These buttons start a real OAuth flow on the backend. When credentials are
// not configured the backend returns a clear 503 rather than faking a login.
async function start(provider: "google" | "apple") {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/oauth/${provider}/start`, {
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(
        typeof body?.detail === "string"
          ? body.detail
          : `${provider} sign-in is not configured on this deployment.`,
      );
    } else {
      window.location.href = (await res.json()).redirect;
    }
  } catch {
    alert(`${provider} sign-in is not available right now.`);
  }
}

export function OAuthButtons() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => start("google")}
        className="flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-bg-surface text-sm font-medium text-text hover:border-border-strong focus-ring"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <button
        type="button"
        onClick={() => start("apple")}
        className="flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-bg-surface text-sm font-medium text-text hover:border-border-strong focus-ring"
      >
        <AppleIcon /> Continue with Apple
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-1.7 4.1-5.4 4.1-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.7 14.6 3 12 3 6.9 3 2.9 7 2.9 12s4 9 9.1 9c5.2 0 8.7-3.7 8.7-8.9 0-.6-.1-1-.1-1.4H12z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M16.4 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9s-1.9-.9-3.1-.8c-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.1 1.7 2.4 2.9 2.4 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.9-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.4-1-2.4-3.7zM14 4.9c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.5 2.7-1.3z"
      />
    </svg>
  );
}
