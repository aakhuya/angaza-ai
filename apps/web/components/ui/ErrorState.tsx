import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong", description, onRetry,
}: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-danger-soft bg-danger/5 px-6 py-10 text-center">
      <p className="text-sm font-medium text-text">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-text-muted">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">Retry</Button>
      )}
    </div>
  );
}
