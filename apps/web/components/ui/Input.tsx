import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & {
  label?: string; error?: string;
}>(function Input({ label, error, id, className = "", ...rest }, ref) {
  const inputId = id ?? rest.name;
  return (
    <label className="block" htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          "h-10 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text",
          "placeholder:text-text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          error && "border-danger", className,
        ].filter(Boolean).join(" ")}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
});
