"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "@/lib/auth";
import type { User } from "@/types/api";

const NAV: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/matches", label: "Matches", icon: "ball" },
  { href: "/analysis", label: "Analysis", icon: "chart" },
  { href: "/recaps", label: "Recaps", icon: "doc" },
  { href: "/players", label: "Players", icon: "user" },
  { href: "/agents", label: "Agents", icon: "agent" },
  { href: "/settings", label: "Settings", icon: "cog" },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-bg-surface md:flex">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 border-b border-border px-5 py-4 focus-ring rounded-none"
      >
        <LogoMark />
        <span className="flex flex-col leading-none">
          <span className="text-[0.78rem] font-semibold tracking-[0.02em]">ANGAZA AI</span>
          <span className="mt-1 text-[0.58rem] uppercase tracking-[0.14em] text-text-faint">
            Illuminate every moment
          </span>
        </span>
      </Link>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-md px-2.5 py-2 text-[0.8rem] transition-colors focus-ring",
                    active
                      ? "bg-bg-elevated text-text"
                      : "text-text-muted hover:bg-bg-elevated hover:text-text",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-5 w-5 items-center justify-center",
                      active ? "text-accent" : "",
                    ].join(" ")}
                  >
                    <Icon name={item.icon} />
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <span
                      className="ml-auto h-1 w-1 rounded-full bg-accent"
                      aria-hidden
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md border border-border bg-bg px-2.5 py-2.5">
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bg-elevated">
            <Image
              src="/media/avatar-default.jpg"
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.8rem] font-medium leading-tight">
              {user.display_name || user.email}
            </div>
            <div className="truncate text-[0.58rem] uppercase tracking-[0.1em] text-text-faint">
              Football analyst
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={pending}
            title="Sign out"
            aria-label="Sign out"
            className="rounded p-1 text-text-faint hover:text-text focus-ring disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <path d="M15 12H3 M9 6l-6 6 6 6 M21 3v18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function LogoMark() {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <defs>
          <linearGradient id="sideMark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5B33F" />
            <stop offset="100%" stopColor="#B87A1E" />
          </linearGradient>
        </defs>
        <path d="M12 2 L22 20 H16 L12 12 L8 20 H2 Z" fill="url(#sideMark)" />
      </svg>
    </span>
  );
}

type IconName = "home" | "ball" | "chart" | "doc" | "user" | "agent" | "cog";

function Icon({ name }: { name: IconName }) {
  const cls = "h-4 w-4";
  switch (name) {
    case "home": return <svg viewBox="0 0 24 24" className={cls} aria-hidden><path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinejoin="round"/></svg>;
    case "ball": return <svg viewBox="0 0 24 24" className={cls} aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M12 7l3 2-1 4h-4l-1-4z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/></svg>;
    case "chart": return <svg viewBox="0 0 24 24" className={cls} aria-hidden><path d="M4 20V6M4 20h16M8 20v-6M12 20V9M16 20v-9M20 20V4" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round"/></svg>;
    case "doc": return <svg viewBox="0 0 24 24" className={cls} aria-hidden><path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M10 12h6M10 16h6M10 8h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
    case "user": return <svg viewBox="0 0 24 24" className={cls} aria-hidden><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round"/></svg>;
    case "agent": return <svg viewBox="0 0 24 24" className={cls} aria-hidden><rect x="4" y="7" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M12 4v3M9 12h.01M15 12h.01M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
    case "cog": return <svg viewBox="0 0 24 24" className={cls} aria-hidden><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  }
}
