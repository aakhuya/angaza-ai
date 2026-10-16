import Image from "next/image";

/**
 * Decorative rotating football. Reads the generated PNG from
 * /public/media/football.png.
 *
 * Uses an X-axis roll with a perspective transform rather than a flat spin.
 * A flat spin on a 2D image looks like a pinwheel; a perspective roll looks
 * like the ball is tumbling through space.
 *
 * Decorative only — hidden from assistive tech, motion-suppressed for users
 * who prefer reduced motion.
 */
export function RotatingBall({ size = 140 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none"
      style={{ width: size, height: size, perspective: 600 }}
    >
      <Image
        src="/media/football.png"
        alt=""
        width={size}
        height={size}
        priority
        className="h-full w-full object-contain motion-safe:animate-[roll-x_24s_linear_infinite]"
      />
    </div>
  );
}
