import Link from "next/link";

/**
 * AngazaBol wordmark.
 *
 * Uses an inline SVG mark plus a text wordmark. No external image asset —
 * this keeps branding editable, removes the pixel-baked text issue, and
 * renders crisply at any size.
 */
export function Logo({
  compact = false,
  asLink = true,
}: {
  compact?: boolean;
  asLink?: boolean;
}) {
  const content = (
    <span className="flex items-center gap-2.5 rounded-md focus-ring">
      <Mark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight">AngazaBol</span>
          <span className="mt-1 text-[0.62rem] uppercase tracking-[0.15em] text-text-faint">
            See the game beneath the game
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

function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="angazabol-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5B33F" />
          <stop offset="100%" stopColor="#B87A1E" />
        </linearGradient>
      </defs>
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="8"
        fill="none"
        stroke="url(#angazabol-mark)"
        strokeWidth="2.2"
      />
      <path
        d="M12 32 L20 8"
        stroke="url(#angazabol-mark)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 32 L20 8"
        stroke="url(#angazabol-mark)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15.5 22 L24.5 22"
        stroke="url(#angazabol-mark)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
