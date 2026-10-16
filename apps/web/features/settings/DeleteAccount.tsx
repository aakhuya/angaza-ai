"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function DeleteAccount() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <div className="rounded-md border border-danger-soft bg-danger/5 p-4">
        <div className="text-sm font-medium text-danger">Delete account</div>
        <p className="mt-1 text-xs text-text-muted">
          Permanently delete your account, preferences, and avatar. This cannot be undone.
        </p>
        <Button
          type="button"
          variant="danger"
          size="sm"
          className="mt-3"
          onClick={() => setConfirming(true)}
        >
          Delete account
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-danger-soft bg-danger/5 p-4">
      <div className="text-sm font-medium text-danger">
        Are you absolutely sure?
      </div>
      <p className="mt-1 text-xs text-text-muted">
        Type <span className="font-mono text-danger">DELETE</span> to confirm.
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value.toUpperCase())}
        aria-label="Type DELETE to confirm"
        className="mt-3 h-9 w-full max-w-[220px] rounded-md border border-border bg-bg-surface px-3 font-mono text-sm text-text focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/30"
      />
      {error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={typed !== "DELETE"}
          loading={loading}
          onClick={onDelete}
        >
          Permanently delete
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setConfirming(false);
            setTyped("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
