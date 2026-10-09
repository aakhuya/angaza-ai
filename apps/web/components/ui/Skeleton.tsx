export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={["animate-pulse rounded-md bg-bg-elevated", className].join(" ")} aria-hidden />;
}
