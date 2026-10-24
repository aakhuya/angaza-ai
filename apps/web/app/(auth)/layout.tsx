import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";
import { findHeroImage } from "@/lib/heroImage";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const heroImage = findHeroImage();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* ── Top: image panel, faded into the page below ─────────────── */}
      <header className="relative isolate h-[36svh] min-h-[220px] overflow-hidden sm:h-[42svh] lg:h-[46svh]">
        {heroImage ? (
          <Image
            src={heroImage.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_35%] sm:object-[70%_center] lg:object-center"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 400px at 78% 20%, rgba(232,188,103,0.20), transparent 55%)," +
                "radial-gradient(700px 340px at 15% 100%, rgba(57,214,176,0.12), transparent 60%)," +
                "linear-gradient(180deg, #0E141C 0%, #080B10 100%)",
            }}
          />
        )}

        {/* Left scrim for headline legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(8,11,16,0.92) 0%, rgba(8,11,16,0.62) 45%, rgba(8,11,16,0.28) 75%, rgba(8,11,16,0.72) 100%)",
          }}
        />
        {/* Top fade for the header, and the crucial bottom fade into the page. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-24"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(8,11,16,0.7) 0%, rgba(8,11,16,0) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(8,11,16,0) 0%, rgba(8,11,16,1) 90%)",
          }}
        />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Logo />
            <Link
              href="/"
              className="rounded-md px-2 py-1 text-xs text-text-muted hover:text-text focus-ring"
            >
              ← Back home
            </Link>
          </div>

          <div className="mt-auto max-w-2xl pb-6 sm:pb-8">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
              AngazaBol
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-[1.05] tracking-tight sm:text-3xl lg:text-4xl">
              Smarter insights.
              <br className="hidden sm:block" />
              <span className="text-accent"> Deeper stories.</span>
            </h1>
          </div>
        </div>
      </header>

      <main id="main" className="relative flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
