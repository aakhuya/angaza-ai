import Image from "next/image";
import Link from "next/link";

/**
 * AngazaBol wordmark.
 *
 * The PNG at /public/media/logo.png contains only the mark (no text),
 * so we render it alongside a live text wordmark. If the PNG ever grows
 * baked-in text, drop the `<span>` block below.
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
      <Image
        src="/media/logo.png"
        alt=""
        width={44}
        height={44}
        priority
        className="h-11 w-11 shrink-0 object-contain"
      />
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
