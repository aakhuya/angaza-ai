"use client";

import { Camera, Check, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import type { Profile } from "@/types/api";
import { patchProfile, uploadAvatar } from "./client";

type Status = "idle" | "saving" | "saved" | "error";

export function ProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState<Profile>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const next = await uploadAvatar(file);
      setForm((prev) => ({ ...prev, avatar_url: next.avatar_url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      const next = await patchProfile({
        display_name: form.display_name,
        username: form.username ?? undefined,
        favorite_team: form.favorite_team,
        favorite_player: form.favorite_player,
      });
      setForm(next);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Save failed");
    }
  }

  const initials = (form.display_name || form.username || "A").slice(0, 1).toUpperCase();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-bg-elevated text-2xl font-semibold text-accent">
            {form.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Upload profile picture"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg-surface text-text-muted hover:text-text focus-ring"
          >
            {uploading ? (
              <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <Camera size={13} strokeWidth={1.75} />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={onAvatarChange}
          />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium">{form.display_name || "Your name"}</div>
          <div className="mt-0.5 text-xs text-text-muted">
            PNG, JPG or WebP. Up to 3 MB.
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={13} strokeWidth={1.75} /> Change picture
          </Button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Display name"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          placeholder="Ada Lovelace"
        />
        <Input
          label="Username"
          value={form.username ?? ""}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
          }
          placeholder="ada_l"
          hint="Letters, numbers and underscores. 3–40 characters."
        />
        <Input
          label="Favorite team"
          value={form.favorite_team}
          onChange={(e) => setForm({ ...form, favorite_team: e.target.value })}
          placeholder="Angaza FC"
        />
        <Input
          label="Favorite player"
          value={form.favorite_player}
          onChange={(e) => setForm({ ...form, favorite_player: e.target.value })}
          placeholder="HOME-p09"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "saving"}>Save changes</Button>
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-xs text-success">
            <Check size={13} strokeWidth={2} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
