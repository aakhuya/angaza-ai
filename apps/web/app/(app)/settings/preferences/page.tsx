import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getPreferences } from "@/features/settings/client";
import { PreferencesForm } from "@/features/settings/PreferencesForm";

export default async function PreferencesPage() {
  const prefs = await getPreferences().catch(() => ({
    viewer_mode: "analyst" as const,
    language: "en",
    explanation_detail: "standard" as const,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Preferences</h1>
        <p className="mt-1 text-sm text-text-muted">
          The Personalization agent rewrites tone, depth, and emphasis — never the
          underlying numbers.
        </p>
      </div>

      <Card>
        <CardHeader><span className="text-sm font-medium">Experience</span></CardHeader>
        <CardBody><PreferencesForm initial={prefs} /></CardBody>
      </Card>
    </div>
  );
}
