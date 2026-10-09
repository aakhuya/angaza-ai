"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { patchProfile } from "./client";
import type { Profile } from "@/types/api";

export function ProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState<Profile>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const next = await patchProfile(form);
      setForm(next);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Display name"
        value={form.display_name}
        onChange={(e) => setForm({ ...form, display_name: e.target.value })}
      />
      <Input
        label="Favorite team"
        value={form.favorite_team}
        onChange={(e) => setForm({ ...form, favorite_team: e.target.value })}
      />
      <Input
        label="Favorite player"
        value={form.favorite_player}
        onChange={(e) => setForm({ ...form, favorite_player: e.target.value })}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "saving"}>Save</Button>
        {status === "saved" && <span className="text-xs text-teal">Saved.</span>}
        {status === "error" && <span className="text-xs text-danger">Save failed.</span>}
      </div>
    </form>
  );
}
