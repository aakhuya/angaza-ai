import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getProfile } from "@/features/settings/client";
import { getTeams } from "@/features/settings/client";
import { ProfileForm } from "@/features/settings/ProfileForm";

// Never serve a cached version of this page — profile edits must always
// reflect what the server currently has.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const [profile, teams] = await Promise.all([
    getProfile().catch(() => ({
      display_name: "",
      username: null,
      avatar_url: "",
      favorite_team: "",
      favorite_player: "",
    })),
    getTeams().catch(() => null),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 lg:space-y-8">
      <header>
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your account</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your identity across Angaza. These details appear in the navigation and personalise insights.
        </p>
      </header>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium">Profile</span>
        </CardHeader>
        <CardBody>
          <ProfileForm initial={profile} teams={teams} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-danger">Danger zone</span>
        </CardHeader>
        <CardBody>
          <DeleteAccountWrapper />
        </CardBody>
      </Card>
    </div>
  );
}

async function DeleteAccountWrapper() {
  const { DeleteAccount } = await import("@/features/settings/DeleteAccount");
  return <DeleteAccount />;
}
