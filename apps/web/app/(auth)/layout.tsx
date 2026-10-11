import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";
import { findHeroImage } from "@/lib/heroImage";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const heroImage = findHeroImage();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* ── Top: image panel with headline ────────────────────────────── */}
      <header className="relative isolate h-[38svh] min-h-[220px] overflow-hidden border-b border-border sm:h-[42svh] lg:h-[44svh]">
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
                "radial-gradient(900px 400px at 78% 20%, rgba(245,179,63,0.20), transparent 55%)," +
                "radial-gradient(700px 340px at 15% 100%, rgba(79,189,176,0.12), transparent 60%)," +
                "linear-gradient(180deg, #0C1013 0%, #090B0D 100%)",
            }}
          />
        )}

        {/* Left-side scrim so the headline stays legible over the photo. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(8,10,12,0.90) 0%, rgba(8,10,12,0.60) 45%, rgba(8,10,12,0.28) 75%, rgba(8,10,12,0.72) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(8,10,12,0.55) 0%, rgba(8,10,12,0) 40%, rgba(8,10,12,0.95) 100%)",
          }}
        />

        {/* Header content: logo + back home */}
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

          <div className="mt-auto max-w-2xl pb-5 sm:pb-7">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
              Angaza AI
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-[1.05] tracking-tight sm:text-3xl lg:text-4xl">
              Smarter insights.
              <br className="hidden sm:block" />
              <span className="text-accent"> Deeper stories.</span>
            </h1>
          </div>
        </div>
      </header>

      {/* ── Bottom: form panel on the dark base ───────────────────────── */}
      <main id="main" className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
