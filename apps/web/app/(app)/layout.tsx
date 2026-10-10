import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/Button";
import { getMe } from "@/lib/auth-server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Angaza AI</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">Your session is not recognised</h1>
          <p className="mt-2 text-sm text-text-muted">
            The dashboard layout could not verify your session with the API. This usually means
            the API is not reachable from the server, or the auth cookie was not forwarded.
            Check <span className="font-mono">/debug</span> for details, then sign in again.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/login"><Button>Sign in</Button></Link>
            <Link href="/debug"><Button variant="secondary">Open debug</Button></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav user={user} />
      <main id="main" className="flex-1 scroll-mt-16">
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
