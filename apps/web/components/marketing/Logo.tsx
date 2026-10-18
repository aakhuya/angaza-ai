import Image from "next/image";
import Link from "next/link";

/**
 * Angaza AI mark. Reads the generated PNG from /public/media/logo.png.
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
      <LogoMark />
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

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/media/logo.png"
      alt=""
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );
}
