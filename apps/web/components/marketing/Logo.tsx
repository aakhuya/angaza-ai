import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 focus-ring rounded-md">
      <span className="relative flex h-6 w-6 items-center justify-center" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <defs>
            <linearGradient id="angazaMark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0A93A" />
              <stop offset="100%" stopColor="#B87A1E" />
            </linearGradient>
          </defs>
          <path d="M12 2 L22 20 H16 L12 12 L8 20 H2 Z" fill="url(#angazaMark)" />
        </svg>
      </span>
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
