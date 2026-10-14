import Link from "next/link";

/**
 * Angaza AI monogram: an "A" built from a football pitch's halfway line and
 * center circle. Distinctive, clearly football, unmistakably a letter A.
 *
 * When `asLink` is false, the logo renders as plain markup — use this when
 * the logo is already inside another <Link>. Nested <a> is invalid HTML and
 * breaks React hydration.
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

export function Monogram({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="angaza-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8BC67" />
          <stop offset="100%" stopColor="#A67C2B" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="none" stroke="url(#angaza-mark)" strokeWidth="2" />
      <path d="M10 26 L16 6" stroke="url(#angaza-mark)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M22 26 L16 6" stroke="url(#angaza-mark)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="17" r="3.2" fill="none" stroke="url(#angaza-mark)" strokeWidth="1.6" />
      <path d="M12.5 17 L19.5 17" stroke="url(#angaza-mark)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
