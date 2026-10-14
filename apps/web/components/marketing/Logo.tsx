import Link from "next/link";

/**
 * Angaza AI mark: a football (circle with pentagon panels) with a bold
 * letter "A" cut into it. Reads clearly at 16px (favicon) and up.
 *
 * `asLink` is false when the logo is already inside another <Link>. Nested
 * <a> is invalid HTML and breaks React hydration.
 */
export function Logo({
  compact = false,
  asLink = true,
}: {
  compact?: boolean;
  asLink?: boolean;
}) {
  const content = (
    <span className="flex items-center gap-2 rounded-md focus-ring">
      <Monogram />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">ANGAZA AI</span>
          <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-text-faint">
            Illuminate Every Moment
          </span>
        </span>
      )}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href="/" className="inline-flex">
      {content}
    </Link>
  );
}

export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="angaza-football" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8BC67" />
          <stop offset="100%" stopColor="#A67C2B" />
        </linearGradient>
        <radialGradient id="angaza-mark-shade" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0%" stopColor="#1A222D" />
          <stop offset="100%" stopColor="#080B10" />
        </radialGradient>
      </defs>

      {/* Football circle — the ball */}
      <circle cx="16" cy="16" r="14" fill="url(#angaza-mark-shade)" />
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="url(#angaza-football)"
        strokeWidth="2"
      />

      {/* Central pentagon, cut into the ball */}
      <polygon
        points="16,10.5 21,14 19.2,20 12.8,20 11,14"
        fill="none"
        stroke="url(#angaza-football)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Five surrounding seam markers — small arcs suggesting panel seams */}
      <g stroke="url(#angaza-football)" strokeWidth="0.9" strokeLinecap="round" fill="none">
        <line x1="16" y1="10.5" x2="16" y2="4" />
        <line x1="21" y1="14" x2="27" y2="12" />
        <line x1="19.2" y1="20" x2="23" y2="25" />
        <line x1="12.8" y1="20" x2="9" y2="25" />
        <line x1="11" y1="14" x2="5" y2="12" />
      </g>

      {/* The letter "A" overlaid, centered in the ball.
          Rendered as a filled triangle with a crossbar cut out, so it reads
          as a bold glyph rather than strokes. */}
      <path
        d="M16 9.5 L21 22 L18.6 22 L16 15.2 L13.4 22 L11 22 Z"
        fill="url(#angaza-football)"
      />
      <rect x="13.6" y="17.4" width="4.8" height="1.4" fill="url(#angaza-football)" />
    </svg>
  );
}
