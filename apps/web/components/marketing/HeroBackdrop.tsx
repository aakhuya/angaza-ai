import Image from "next/image";

import type { HeroImage } from "@/lib/heroImage";

/**
 * Full-bleed hero backdrop.
 *
 * With an image: renders it with a tuned focal point per breakpoint, then
 * applies two scrims (horizontal for headline legibility, vertical for top
 * and bottom fade). No line overlays — the photograph is the design.
 *
 * Without an image: renders a designed gradient scene with a soft stand
 * silhouette. No external asset, no licensing risk.
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
          className="object-cover object-[62%_30%] sm:object-[70%_center] lg:object-center scale-[1.03]"
        />
      ) : (
        <DesignedPitch />
      )}

      {/*
        Horizontal scrim: darkens the left where the headline lives.
        Vertical scrim: fades the top for the transparent header and the
        bottom into the next section.
        Kept to two layers — no additional tints.
      */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,10,12,0.92) 0%, rgba(8,10,12,0.66) 42%, rgba(8,10,12,0.30) 70%, rgba(8,10,12,0.86) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(8,10,12,0.72) 0%, rgba(8,10,12,0) 26%, rgba(8,10,12,0) 66%, rgba(8,10,12,0.95) 100%)",
        }}
      />
    </div>
  );
}

function DesignedPitch() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 620px at 76% 18%, rgba(245,179,63,0.20), transparent 55%)," +
            "radial-gradient(800px 540px at 18% 100%, rgba(79,189,176,0.12), transparent 60%)," +
            "linear-gradient(180deg, #0C1013 0%, #090B0D 60%, #06070A 100%)",
        }}
      />
    </div>
  );
}
