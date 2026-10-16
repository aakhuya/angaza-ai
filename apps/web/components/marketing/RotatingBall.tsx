import Image from "next/image";

/**
 * Decorative rotating football. Reads the generated PNG from
 * /public/media/football.png.
 *
 * Rotation is a Y-axis roll with a slight resting tilt — the ball turns
 * left-right like it's spinning in place on the ground, rather than
 * tumbling forward or flipping top-to-bottom.
 *
 * Decorative only — hidden from assistive tech, motion-suppressed for users
 * who prefer reduced motion.
 */
export function RotatingBall({ size = 140 }: { size?: number }) {
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
        className="h-full w-full object-contain motion-safe:animate-[roll-y_6s_ease-in-out_infinite]"
      />
    </div>
  );
}
