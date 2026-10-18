import { redirect } from "next/navigation";

import { TopNav } from "@/components/app/TopNav";
import { getProfile } from "@/features/settings/server";
import { getMe } from "@/lib/auth-server";
import { serverApi } from "@/lib/api-server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  if (!user) redirect("/login");

  const profile = await getProfile().catch(() => null);
  const avatarUrl = profile?.avatar_url || "";

  const liveStatus = await serverApi
    .get<{ count: number }>("/live/status")
    .catch(() => ({ count: 0 }));

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-sm focus:text-text focus-ring"
      >
        Skip to content
      </a>

      <TopNav user={user} avatarUrl={avatarUrl} hasLive={liveStatus.count > 0} />

      <main id="main" className="flex-1 scroll-mt-16">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
