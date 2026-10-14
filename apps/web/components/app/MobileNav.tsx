"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Home,
  LayoutGrid,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: LayoutGrid },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/recaps", label: "Recaps", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="sticky bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center gap-1 py-2.5 text-[0.6rem] uppercase tracking-[0.08em] focus-ring rounded-md",
                  active ? "text-accent" : "text-text-faint",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className={active ? "text-accent" : ""}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
