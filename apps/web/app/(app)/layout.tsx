import { redirect } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { getMe } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav user={user} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <footer className="border-t border-border px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-mono text-2xs text-text-faint">
          <span>Angaza AI</span>
          <span>Illuminate Every Moment.</span>
        </div>
      </footer>
    </div>
  );
}
