"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  FileText,
  Home,
  LayoutGrid,
  MoreHorizontal,
  Radio,
  Trophy,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

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
];

const MORE: NavItem[] = [
  { href: "/league", label: "League", icon: Trophy },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/recaps", label: "Recaps", icon: FileText },
  { href: "/players", label: "Players", icon: Users },
  { href: "/agents", label: "Agents", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav({ hasLive = false }: { hasLive?: boolean }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const moreActive = MORE.some((m) => isActive(m.href));

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {moreOpen && (
        <div
          role="dialog"
          aria-label="More destinations"
          className="fixed inset-x-3 bottom-20 z-50 rounded-2xl border border-border bg-bg-surface p-2 shadow-pop lg:hidden"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-2xs uppercase tracking-wider text-text-faint">More</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Close"
              className="rounded p-1 text-text-muted hover:text-text focus-ring"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
          <ul>
            {MORE.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 rounded-md px-3 py-3 text-sm",
                      active
                        ? "bg-bg-elevated text-text"
                        : "text-text-muted hover:bg-bg-elevated hover:text-text",
                    ].join(" ")}
                  >
                    <Icon size={16} strokeWidth={1.75} className={active ? "text-accent" : ""} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <nav aria-label="Primary mobile" className="fixed inset-x-3 bottom-3 z-50 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-border bg-bg-surface/95 px-1 py-1 shadow-pop backdrop-blur">
          {PRIMARY.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[0.6rem] uppercase tracking-[0.08em] focus-ring",
                  active ? "text-accent" : "text-text-faint",
                ].join(" ")}
              >
                <span className="relative">
                  <Icon size={18} strokeWidth={1.75} />
                  {item.live && hasLive && (
                    <span
                      aria-label="Live match in progress"
                      className="absolute -right-1 -top-1 h-1.5 w-1.5 animate-pulse-dot rounded-full bg-danger"
                    />
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-label="More destinations"
            className={[
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[0.6rem] uppercase tracking-[0.08em] focus-ring",
              moreActive ? "text-accent" : "text-text-faint",
            ].join(" ")}
          >
            <MoreHorizontal size={18} strokeWidth={1.75} />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
