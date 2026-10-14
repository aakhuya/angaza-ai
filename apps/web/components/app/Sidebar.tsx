"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Cog,
  FileText,
  Home,
  LayoutGrid,
  Users,
} from "lucide-react";

import { Logo } from "@/components/marketing/Logo";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: LayoutGrid },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/recaps", label: "Recaps", icon: FileText },
  { href: "/players", label: "Players", icon: Users },
  { href: "/agents", label: "Agents", icon: Activity },
  { href: "/settings", label: "Settings", icon: Cog },
];

export function Sidebar({ user, avatarUrl = "" }: { user: { display_name?: string; email: string }; avatarUrl?: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-bg-surface md:flex">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 border-b border-border px-5 py-4 focus-ring rounded-none"
      >
        <Logo compact asLink={false} />
      </Link>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
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
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className={active ? "text-accent" : ""}
                  />
                  <span className="font-medium">{item.label}</span>
                  {active && <span className="ml-auto h-1 w-1 rounded-full bg-accent" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <AccountCard user={user} avatarUrl={avatarUrl} />
    </aside>
  );
}

function AccountCard({ user, avatarUrl }: { user: { display_name?: string; email: string }; avatarUrl: string }) {
  return (
    <div className="border-t border-border p-3">
      <Link
        href="/settings/profile"
        className="flex items-center gap-2.5 rounded-md border border-border bg-bg px-2.5 py-2.5 focus-ring hover:border-border-strong"
      >
        <Avatar url={avatarUrl} fallback={(user.display_name || user.email).slice(0, 1).toUpperCase()} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[0.8rem] font-medium leading-tight">
            {user.display_name || user.email.split("@")[0]}
          </div>
          <div className="truncate text-[0.58rem] uppercase tracking-[0.1em] text-text-faint">
            Football analyst
          </div>
        </div>
        <Cog size={14} strokeWidth={1.75} className="text-text-faint" aria-hidden />
      </Link>
    </div>
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
