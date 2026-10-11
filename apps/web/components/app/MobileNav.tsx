"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { User } from "@/types/api";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/analysis", label: "Analysis" },
  { href: "/recaps", label: "Recaps" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav({ user }: { user: User }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="sticky bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur md:hidden"
    >
      <ul className="flex justify-around">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center gap-1 py-2 text-2xs uppercase tracking-wider focus-ring rounded-md",
                  active ? "text-accent" : "text-text-faint",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1 w-1 rounded-full",
                    active ? "bg-accent" : "bg-transparent",
                  ].join(" ")}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
