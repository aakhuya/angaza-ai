import { getProfile } from "@/features/settings/client";
import { ProfileForm } from "@/features/settings/ProfileForm";
import { DeleteAccount } from "@/features/settings/DeleteAccount";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default async function ProfilePage() {
  const profile = await getProfile().catch(() => ({
    display_name: "",
    username: null,
    avatar_url: "",
    favorite_team: "",
    favorite_player: "",
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your account</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your identity across Angaza. These details appear on the sidebar and personalise insights.
        </p>
      </header>

      <Card>
        <CardHeader><span className="text-sm font-medium">Profile</span></CardHeader>
        <CardBody>
          <ProfileForm initial={profile} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-danger">Danger zone</span>
        </CardHeader>
        <CardBody>
          <DeleteAccount />
        </CardBody>
      </Card>
    </div>
  );
}
