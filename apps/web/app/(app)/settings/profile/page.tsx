import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getProfile } from "@/features/settings/client";
import { ProfileForm } from "@/features/settings/ProfileForm";

export default async function ProfilePage() {
  const profile = await getProfile().catch(() => ({
    display_name: "", favorite_team: "", favorite_player: "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your display name and favorite club/player are used to personalize insights.
        </p>
      </div>

      <Card>
        <CardHeader><span className="text-sm font-medium">Details</span></CardHeader>
        <CardBody><ProfileForm initial={profile} /></CardBody>
      </Card>
    </div>
  );
}
