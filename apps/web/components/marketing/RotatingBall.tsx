import Image from "next/image";

/**
 * Static football photo next to the "story behind the scoreline" band.
 *
 * A flat PNG cannot be animated into a convincing 3D rotation (there is no
 * back face, so it "swaps" rather than turns). Rather than fake the effect,
 * we present the ball as a static, well-composed photograph. This is what
 * premium product pages do.
 */
export function RotatingBall({ size = 160 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none"
      style={{ width: size, height: size }}
    >
      <Image
        src="/media/football.png"
        alt=""
        width={size}
        height={size}
        priority
        className="h-full w-full object-contain"
      />
    </div>
  );
}
