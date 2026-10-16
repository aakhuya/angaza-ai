"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Cog,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  Radio,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/marketing/Logo";
import { SidebarToggle } from "./SidebarToggle";
import { logout } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  /** When true, the item shows a live indicator (red dot). */
  live?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: LayoutGrid },
  { href: "/live", label: "Live now", icon: Radio, live: true },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/recaps", label: "Recaps", icon: FileText },
  { href: "/players", label: "Players", icon: Users },
  { href: "/agents", label: "Agents", icon: Activity },
  { href: "/settings", label: "Settings", icon: Cog },
];

export function Sidebar({
  user,
  avatarUrl = "",
  hasLive = false,
}: {
  user: { display_name?: string; email: string };
  avatarUrl?: string;
  /** True when at least one simulated match is currently streaming. */
  hasLive?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <aside data-sidebar-root className="hidden w-64 shrink-0 flex-col border-r border-border bg-bg-surface transition-[width] duration-200 md:flex">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3 focus-ring rounded-md"
        >
          <Logo compact asLink={false} />
          <span className="sidebar-label flex min-w-0 flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">Angaza AI</span>
            <span className="mt-1 truncate text-[0.58rem] uppercase tracking-[0.14em] text-text-faint">
              Illuminate every moment
            </span>
          </span>
        </Link>
        <SidebarToggle />
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const showLiveDot = item.live && hasLive;
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
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <Icon size={16} strokeWidth={1.75} className={active ? "text-accent" : ""} />
                    {showLiveDot && (
                      <span
                        aria-label="Live match in progress"
                        className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 animate-pulse-dot rounded-full bg-danger"
                      />
                    )}
                  </span>
                  <span className="sidebar-label font-medium">{item.label}</span>
                  {active && (
                    <span className="ml-auto h-1 w-1 rounded-full bg-accent" aria-hidden />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3 space-y-2">
        <Link
          href="/settings/profile"
          className="sidebar-account flex items-center gap-2.5 rounded-md border border-border bg-bg px-2.5 py-2.5 focus-ring hover:border-border-strong"
        >
          <Avatar url={avatarUrl} fallback={(user.display_name || user.email).slice(0, 1).toUpperCase()} />
          <div className="sidebar-account-text min-w-0 flex-1">
            <div className="truncate text-[0.8rem] font-medium leading-tight">
              {user.display_name || user.email.split("@")[0]}
            </div>
            <div className="truncate text-[0.58rem] uppercase tracking-[0.1em] text-text-faint">
              Football analyst
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.8rem] text-text-muted hover:bg-bg-elevated hover:text-text focus-ring disabled:opacity-50"
        >
          <LogOut size={16} strokeWidth={1.75} />
          <span className="sidebar-label font-medium">{signingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </aside>
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
