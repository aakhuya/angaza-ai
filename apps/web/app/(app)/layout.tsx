import { redirect } from "next/navigation";

import { Sidebar } from "@/components/app/Sidebar";
import { MobileNav } from "@/components/app/MobileNav";
import { Topbar } from "@/components/app/Topbar";
import { getProfile } from "@/features/settings/server";
import { getMe } from "@/lib/auth-server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  if (!user) redirect("/login");

  const profile = await getProfile().catch(() => null);
  const avatarUrl = profile?.avatar_url || "";

  return (
    <div className="flex min-h-screen bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-sm focus:text-text focus-ring"
      >
        Skip to content
      </a>
      <Sidebar user={user} avatarUrl={avatarUrl} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="flex-1 scroll-mt-16">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <MobileNav user={user} />
      </div>
    </div>
  );
}
