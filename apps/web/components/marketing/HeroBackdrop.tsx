import Image from "next/image";

import type { HeroImage } from "@/lib/heroImage";

/**
 * Full-bleed hero backdrop.
 *
 * If a hero image is present, it is rendered as a Next.js <Image> with a
 * priority hint, a dark gradient scrim, and an SVG pitch-line overlay.
 * If not, we render a designed SVG pitch that matches the site palette —
 * no external asset required, no licensing risk.
 */
export function HeroBackdrop({ image }: { image: HeroImage }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {image ? (
        <Image
          src={image.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02]"
        />
      ) : (
        <DesignedPitch />
      )}

      {/* Scrim: darkens top and bottom, keeps the middle readable for headline text on the left. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(10,12,14,0.94) 0%, rgba(10,12,14,0.72) 38%, rgba(10,12,14,0.42) 65%, rgba(10,12,14,0.82) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,12,14,0.75) 0%, rgba(10,12,14,0) 22%, rgba(10,12,14,0) 68%, rgba(10,12,14,0.92) 100%)",
        }}
      />

      {/* Thin pitch-line overlay for a broadcast feel. Purely decorative. */}
      <PitchLines className="absolute inset-0 h-full w-full opacity-[0.18]" />
    </div>
  );
}

function PitchLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="none" className={className}>
      <g stroke="#F0A93A" strokeWidth="0.25" fill="none">
        <rect x="4" y="4" width="152" height="82" />
        <line x1="80" y1="4" x2="80" y2="86" />
        <circle cx="80" cy="45" r="9" />
        <rect x="4" y="24" width="14" height="42" />
        <rect x="142" y="24" width="14" height="42" />
        <rect x="4" y="34" width="6" height="22" />
        <rect x="150" y="34" width="6" height="22" />
        <path d="M 4 4 A 12 12 0 0 0 16 16" />
        <path d="M 156 4 A 12 12 0 0 1 144 16" />
        <path d="M 4 86 A 12 12 0 0 1 16 74" />
        <path d="M 156 86 A 12 12 0 0 0 144 74" />
      </g>
    </svg>
  );
}

function DesignedPitch() {
  // Fallback: an SVG pitch scene tuned to the palette. No photo, no license risk.
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 78% 12%, rgba(240,169,58,0.22), transparent 55%)," +
            "radial-gradient(900px 600px at 20% 100%, rgba(79,189,176,0.14), transparent 60%)," +
            "linear-gradient(180deg, #0B1013 0%, #0A0C0E 60%, #06070A 100%)",
        }}
      />
      {/* Stand silhouette (simple repeated arcs) */}
      <svg
        viewBox="0 0 160 90"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-[0.5]"
      >
        <defs>
          <linearGradient id="stand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#131A1F" />
            <stop offset="100%" stopColor="#080B0D" />
          </linearGradient>
        </defs>
        {Array.from({ length: 8 }).map((_, row) => (
          <rect
            key={row}
            x={0}
            y={row * 2}
            width={160}
            height={1.4}
            fill="url(#stand)"
            opacity={0.9 - row * 0.08}
          />
        ))}
        <circle cx="80" cy="44" r="14" fill="rgba(240,169,58,0.05)" />
      </svg>
      <PitchLines className="absolute inset-0 h-full w-full opacity-25" />
    </div>
  );
}
