"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Read persisted theme after mount to avoid SSR mismatch.
  useEffect(() => {
    const stored = (localStorage.getItem("angaza.theme") as Theme | null) ?? "dark";
    setTheme(stored);
    setMounted(true);
    document.documentElement.classList.toggle("light", stored === "light");
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("angaza.theme", next);
    } catch {
      // localStorage can fail in private mode; the class is still applied.
    }
  }

  if (!mounted) {
    // Avoid hydration mismatch — render the same tree on server and client
    // before the effect runs.
    return (
      <div className="inline-flex rounded-md border border-border bg-bg-surface p-0.5">
        <span className="px-3 py-1.5 text-xs text-text-muted">Dark</span>
        <span className="px-3 py-1.5 text-xs text-text-muted">Light</span>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-md border border-border bg-bg-surface p-0.5"
    >
      <button
        type="button"
        onClick={() => apply("dark")}
        aria-pressed={theme === "dark"}
        className={[
          "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium focus-ring",
          theme === "dark" ? "bg-bg-elevated text-text" : "text-text-muted hover:text-text",
        ].join(" ")}
      >
        <Moon size={13} strokeWidth={1.75} /> Dark
      </button>
      <button
        type="button"
        onClick={() => apply("light")}
        aria-pressed={theme === "light"}
        className={[
          "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium focus-ring",
          theme === "light" ? "bg-bg-elevated text-text" : "text-text-muted hover:text-text",
        ].join(" ")}
      >
        <Sun size={13} strokeWidth={1.75} /> Light
      </button>
    </div>
  );
}
