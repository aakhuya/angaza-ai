"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/auth.client";
import type { User } from "@/types/api";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/matches", label: "Matches" },
  { href: "/agents", label: "Agents" },
  { href: "/settings/profile", label: "Settings" },
];

export function AppNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try { await logout(); } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="block h-2 w-2 rounded-full bg-accent" aria-hidden />
            <span className="font-semibold tracking-tight">Angaza AI</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "rounded-md px-3 py-1.5 text-sm transition-colors focus-ring",
                    active ? "bg-bg-elevated text-text" : "text-text-muted hover:text-text",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="max-w-[12rem] truncate text-xs text-text-muted">
            {user.display_name || user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout} loading={pending}>Sign out</Button>
        </div>

        <button
          className="rounded-md p-2 text-text-muted hover:text-text focus-ring md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-bg-surface md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-text-muted hover:bg-bg-elevated hover:text-text"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={onLogout}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-text-muted hover:bg-bg-elevated hover:text-text"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
