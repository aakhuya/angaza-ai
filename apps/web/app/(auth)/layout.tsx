import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";
import { findHeroImage } from "@/lib/heroImage";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const heroImage = findHeroImage();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      {/* ── Top: image panel that fades into the page below ──────────── */}
      <header className="relative isolate h-[34svh] min-h-[200px] sm:h-[40svh] lg:h-[46svh]">
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
                "radial-gradient(900px 400px at 78% 20%, rgba(245,179,63,0.14), transparent 55%)," +
                "radial-gradient(700px 340px at 15% 100%, rgba(63,196,168,0.10), transparent 60%)," +
                "linear-gradient(180deg, #0A0A0A 0%, #020202 100%)",
            }}
          />
        )}

        {/*
          The scrim has three stops:
          - top: darkens the image behind the header (logo + back link)
          - middle: gradient out so the mid of the image reads clearly
          - bottom: hard fade to #020202 so the image dissolves into the
            page background with no visible seam at mobile OR desktop.
          The bottom fade extends 20svh down — well past the header height —
          so even the tallest panels fade smoothly.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-20"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "20svh",
            backgroundImage:
              "linear-gradient(180deg, rgba(2,2,2,0) 0%, rgba(2,2,2,0.6) 40%, rgba(2,2,2,1) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.45) 40%, rgba(2,2,2,0.10) 70%, rgba(2,2,2,0.55) 100%)",
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

          <div className="mt-auto max-w-2xl pb-10 sm:pb-14 lg:pb-16">
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

      {/* ── Form area — sits on the pure-black page background, no seam ── */}
      <main
        id="main"
        className="relative flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:px-6 sm:pt-6 lg:px-8"
      >
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
