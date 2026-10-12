"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { completeOnboarding, type OnboardingState } from "./client";

/**
 * Teams are the simulated rosters used by the simulator, not real clubs.
 * Using short monograms avoids trademarked crests and keeps the submission
 * clear of third-party brand assets.
 */
const TEAMS = [
  { id: "HOME", label: "Angaza FC", short: "ANG" },
  { id: "AWAY", label: "Mwangaza United", short: "MWU" },
];

const PLAYERS_BY_TEAM: Record<string, Array<{ id: string; name: string; position: string }>> = {
  HOME: [
    { id: "HOME-p06", name: "Midfielder 6", position: "MF" },
    { id: "HOME-p09", name: "Forward 9", position: "FW" },
    { id: "HOME-p11", name: "Forward 11", position: "FW" },
    { id: "HOME-p03", name: "Defender 3", position: "DF" },
  ],
  AWAY: [
    { id: "AWAY-p06", name: "Midfielder 6", position: "MF" },
    { id: "AWAY-p09", name: "Forward 9", position: "FW" },
    { id: "AWAY-p11", name: "Forward 11", position: "FW" },
    { id: "AWAY-p03", name: "Defender 3", position: "DF" },
  ],
};

const MODES: Array<{ id: OnboardingState["viewer_mode"]; label: string; blurb: string }> = [
  { id: "casual", label: "Casual fan", blurb: "Plain language. Emphasis on moments and momentum." },
  { id: "analyst", label: "Analyst", blurb: "Metric-led. Precise tactical framing." },
  { id: "player_focus", label: "Player focus", blurb: "Centred on individual contributions." },
];

export function OnboardingWizard({ initial }: { initial: OnboardingState }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [teams, setTeams] = useState<string[]>(initial.favorite_teams);
  const [players, setPlayers] = useState<string[]>(initial.favorite_players);
  const [mode, setMode] = useState(initial.viewer_mode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle<T>(list: T[], value: T, limit: number): T[] {
    if (list.includes(value)) return list.filter((v) => v !== value);
    if (list.length >= limit) return list;
    return [...list, value];
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      await completeOnboarding({
        favorite_teams: teams,
        favorite_players: players,
        viewer_mode: mode,
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("We couldn't save your preferences. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
          Step {step + 1} of 3
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {step === 0 && "Pick the teams you follow"}
          {step === 1 && "Pick players to spotlight"}
          {step === 2 && "Choose how you want to read the game"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {step === 0 && "Angaza personalizes insights around the teams you care about."}
          {step === 1 && "Player-focused insights will highlight these players first."}
          {step === 2 && "You can change all of this later in Settings."}
        </p>
      </header>

      <Card>
        <CardBody className="p-6">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {TEAMS.map((t) => {
                const active = teams.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTeams(toggle(teams, t.id, 3))}
                    aria-pressed={active}
                    className={[
                      "flex items-center gap-4 rounded-lg border p-4 text-left transition-colors focus-ring",
                      active ? "border-accent bg-accent/10" : "border-border bg-bg-surface hover:border-border-strong",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-12 w-12 items-center justify-center rounded-full font-mono text-sm font-semibold",
                        active ? "bg-accent text-bg" : "bg-bg-elevated text-text-muted",
                      ].join(" ")}
                    >
                      {t.short}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{t.label}</span>
                      <span className="mt-0.5 block text-2xs text-text-faint">
                        {t.id} · simulated roster
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {Object.entries(PLAYERS_BY_TEAM).map(([teamId, roster]) => (
                <div key={teamId}>
                  <div className="mb-3 font-mono text-2xs uppercase tracking-wider text-text-faint">
                    {teamId}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roster.map((p) => {
                      const active = players.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlayers(toggle(players, p.id, 3))}
                          aria-pressed={active}
                          className={[
                            "flex items-center justify-between rounded-md border p-3 text-left transition-colors focus-ring",
                            active ? "border-accent bg-accent/10" : "border-border bg-bg-surface hover:border-border-strong",
                          ].join(" ")}
                        >
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="font-mono text-2xs text-text-faint">{p.position}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              {MODES.map((m) => {
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    aria-pressed={active}
                    className={[
                      "rounded-lg border p-4 text-left transition-colors focus-ring",
                      active ? "border-accent bg-accent/10" : "border-border bg-bg-surface hover:border-border-strong",
                    ].join(" ")}
                  >
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="mt-1 text-xs text-text-muted">{m.blurb}</div>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-danger">{error}</p>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue →</Button>
            ) : (
              <Button onClick={finish} loading={saving}>Finish setup</Button>
            )}
          </div>
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-xs text-text-faint">
        You can skip any step. Everything here is editable later in Settings.
      </p>
    </div>
  );
}
