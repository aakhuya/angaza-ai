import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-text-muted">
          The page you were looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard"><Button>Go to dashboard</Button></Link>
          <Link href="/"><Button variant="secondary">Landing</Button></Link>
        </div>
      </div>
    </main>
  );
}
