"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChevronDown,
  Cog,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  Radio,
  User,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/marketing/Logo";
import { Notifications } from "./Notifications";
import { logout } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  live?: boolean;
};

const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: LayoutGrid },
  { href: "/live", label: "Live", icon: Radio, live: true },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/recaps", label: "Recaps", icon: FileText },
  { href: "/players", label: "Players", icon: Users },
  { href: "/agents", label: "Agents", icon: Activity },
];

export function TopNav({
  user,
  avatarUrl = "",
  hasLive = false,
}: {
  user: { display_name?: string; username?: string; email: string };
  avatarUrl?: string;
  hasLive?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    function onClick(e: MouseEvent) {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  async function onLogout() {
    try {
      await logout();
    } catch {
      // If the API is unreachable, clear cookies client-side so the user
      // is not stuck. The server will reject the stale token on next call.
      document.cookie = "angaza_access=; Max-Age=0; path=/";
      document.cookie = "angaza_refresh=; Max-Age=0; path=/";
    }
    // Hard navigation — discards Next.js server component cache so the
    // landing page sees a logged-out state immediately.
    window.location.href = "/";
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/92 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
{/* Logo + wordmark — always visible, even on mobile */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2.5 focus-ring rounded-md"
        >
          <Logo compact asLink={false} />
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">AngazaBol</span>
            <span className="mt-0.5 text-[0.55rem] uppercase tracking-[0.14em] text-text-faint">
              Illuminate every moment
            </span>
          </span>
        </Link>

        {/* Desktop primary nav */}
        <nav aria-label="Primary" className="ml-6 hidden flex-1 items-center gap-0.5 lg:flex">
          {PRIMARY.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors focus-ring",
                  active
                    ? "bg-bg-elevated text-text"
                    : "text-text-muted hover:bg-bg-elevated hover:text-text",
                ].join(" ")}
              >
                <Icon size={15} strokeWidth={1.75} className={active ? "text-accent" : ""} />
                <span className="font-medium">{item.label}</span>
                {item.live && hasLive && (
                  <span
                    aria-label="Live match in progress"
                    className="ml-0.5 h-1.5 w-1.5 animate-pulse-dot rounded-full bg-danger"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1">
          <Notifications />

          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              className="flex items-center gap-2 rounded-md pl-1 pr-2 py-1 text-sm hover:bg-bg-elevated focus-ring"
            >
              <Avatar url={avatarUrl} fallback={(user.display_name || user.email).slice(0, 1).toUpperCase()} />
              <span className="hidden max-w-[10rem] truncate font-medium md:inline">
                {user.display_name || user.username || user.email.split("@")[0]}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.75}
                className={["hidden text-text-faint md:block", accountOpen ? "rotate-180" : ""].join(" ")}
              />
            </button>

            {accountOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-bg-surface shadow-pop"
              >
                <div className="border-b border-border px-4 py-3">
                  <div className="truncate text-sm font-medium">
                    {user.display_name || user.username || user.email.split("@")[0]}
                  </div>
                  <div className="truncate text-xs text-text-muted">{user.email}</div>
                </div>
                <Link
                  href="/settings/profile"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:bg-bg-elevated hover:text-text"
                  role="menuitem"
                >
                  <User size={15} strokeWidth={1.75} /> Profile
                </Link>
                <Link
                  href="/settings/preferences"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:bg-bg-elevated hover:text-text"
                  role="menuitem"
                >
                  <Cog size={15} strokeWidth={1.75} /> Preferences
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-left text-sm text-text-muted hover:bg-bg-elevated hover:text-text"
                  role="menuitem"
                >
                  <LogOut size={15} strokeWidth={1.75} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}

function Avatar({ url, fallback }: { url: string; fallback: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-deep text-[0.7rem] font-semibold text-bg"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </span>
  );
}
