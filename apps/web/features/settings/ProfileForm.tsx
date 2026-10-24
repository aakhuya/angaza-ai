"use client";

import { Camera, Check, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import type { Profile } from "@/types/api";
import { patchProfile, uploadAvatar, type ClubOption } from "./client";

type Status = "idle" | "saving" | "saved" | "error";

export function ProfileForm({
  initial,
  teams,
}: {
  initial: Profile;
  teams: ClubOption[] | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Profile>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allPlayers = (teams ?? []).flatMap((t) =>
    t.players.map((p) => ({ ...p, team_name: t.name, team_id: t.id })),
  );
  const allTeams = teams ?? [];

  async function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const next = await uploadAvatar(file);
      setForm((prev) => ({ ...prev, avatar_url: next.avatar_url }));
      router.refresh();
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
      const payload: Partial<Profile> = {
        display_name: form.display_name,
        favorite_team: form.favorite_team,
        favorite_player: form.favorite_player,
      };
      if (form.username) payload.username = form.username;

      const next = await patchProfile(payload);
      setForm(next);
      setStatus("saved");
      // Refresh server components (top nav, layout) so the profile change is
      // reflected everywhere on the next paint. Await is important here —
      // without it, a fast click to another page can race the refresh.
      router.refresh();
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError) setError(err.message);
      else setError("Save failed. Check that the API is running.");
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
              <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
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
          <div className="mt-0.5 text-xs text-text-muted">PNG, JPG or WebP. Up to 3 MB.</div>
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

        <Select
          label="Favorite team"
          value={form.favorite_team}
          onChange={(v) => setForm({ ...form, favorite_team: v })}
          options={[
            { value: "", label: allTeams.length ? "None" : "No teams available" },
            ...allTeams.map((t) => ({ value: t.name, label: t.name })),
          ]}
        />

        <Select
          label="Favorite player"
          value={form.favorite_player}
          onChange={(v) => setForm({ ...form, favorite_player: v })}
          options={[
            { value: "", label: "None" },
            ...allPlayers.map((p) => ({
              // Store the readable name; the backend treats it as a plain string.
              value: p.name,
              label: `${p.name} · ${p.position} · ${p.team_name}`,
            })),
          ]}
        />
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-danger-soft bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
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

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
