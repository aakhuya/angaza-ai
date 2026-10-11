import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";
import { findHeroImage } from "@/lib/heroImage";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const heroImage = findHeroImage();

  return (
    <div className="min-h-[100svh] bg-bg lg:grid lg:grid-cols-2">
      {/* ── Image panel ─────────────────────────────────────────────── */}
      <aside className="relative isolate flex h-[26svh] min-h-[190px] flex-col overflow-hidden border-b border-border sm:h-[30svh] lg:h-auto lg:min-h-0 lg:border-b-0 lg:border-r">
        {heroImage ? (
          <Image
            src={heroImage.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[62%_35%] sm:object-[70%_35%] lg:object-[60%_center]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 400px at 78% 20%, rgba(245,179,63,0.20), transparent 55%)," +
                "radial-gradient(700px 340px at 15% 100%, rgba(79,189,176,0.12), transparent 60%)," +
                "linear-gradient(180deg, #0C1013 0%, #090B0D 100%)",
            }}
          />
        )}

        {/* Scrims: keep text legible without flattening the photo. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(8,10,12,0.88) 0%, rgba(8,10,12,0.52) 45%, rgba(8,10,12,0.22) 75%, rgba(8,10,12,0.70) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(8,10,12,0.55) 0%, rgba(8,10,12,0) 45%, rgba(8,10,12,0.90) 100%)",
          }}
        />

        <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between">
            <Logo />
            <Link
              href="/"
              className="rounded-md px-2 py-1 text-xs text-text-muted hover:text-text focus-ring"
            >
              ← Back home
            </Link>
          </div>

          {/* Headline only appears on desktop where there's vertical room. */}
          <div className="mt-auto hidden max-w-lg pb-2 lg:block">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">Angaza AI</p>
            <h1 className="mt-3 text-3xl font-semibold leading-[1.06] tracking-tight xl:text-4xl">
              Smarter insights.
              <br />
              <span className="text-accent">Deeper stories.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-text-muted">
              Explainable match intelligence — deterministic analytics do the math,
              agents explain why the moment mattered.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────────── */}
      <main
        id="main"
        className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:items-center lg:px-10 lg:py-10"
      >
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
