import Link from "next/link";

/**
 * Angaza AI monogram: an "A" built from a football pitch's halfway line and
 * center circle. Distinctive, clearly football, unmistakably a letter A.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 focus-ring rounded-md">
      <Monogram />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">ANGAZA AI</span>
          <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-text-faint">
            Illuminate Every Moment
          </span>
        </span>
      )}
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
      {/* Outer rounded square — the pitch */}
      <rect x="2" y="2" width="28" height="28" rx="7" fill="none" stroke="url(#angaza-mark)" strokeWidth="2" />
      {/* Halfway line forms the left leg of the A */}
      <path d="M10 26 L16 6" stroke="url(#angaza-mark)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Right leg of the A */}
      <path d="M22 26 L16 6" stroke="url(#angaza-mark)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Center circle at the crossbar of the A */}
      <circle cx="16" cy="17" r="3.2" fill="none" stroke="url(#angaza-mark)" strokeWidth="1.6" />
      {/* Crossbar */}
      <path d="M12.5 17 L19.5 17" stroke="url(#angaza-mark)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
