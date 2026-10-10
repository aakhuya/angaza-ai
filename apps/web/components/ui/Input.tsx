import { InputHTMLAttributes, forwardRef, useId } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }
>(function Input({ label, error, hint, id, className = "", ...rest }, ref) {
  const reactId = useId();
  const inputId = id ?? rest.name ?? reactId;
  const describedBy = [error && `${inputId}-err`, hint && `${inputId}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "h-10 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text",
          "placeholder:text-text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          error && "border-danger", className,
        ].filter(Boolean).join(" ")}
        {...rest}
      />
      {hint && !error && (
        <span id={`${inputId}-hint`} className="mt-1 block text-xs text-text-faint">{hint}</span>
      )}
      {error && (
        <span id={`${inputId}-err`} role="alert" className="mt-1 block text-xs text-danger">{error}</span>
      )}
    </div>
  );
});
