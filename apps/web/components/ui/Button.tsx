import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-bg hover:bg-accent/90 disabled:bg-accent/40",
  secondary: "bg-bg-elevated text-text border border-border hover:border-border-strong",
  ghost: "text-text-muted hover:text-text hover:bg-bg-elevated",
  danger: "bg-danger text-white hover:bg-danger/90",
};
// `sm` is bumped to h-10 on touch-size devices so tap targets meet 40px+.
const sizes: Record<Size, string> = {
  sm: "h-10 px-3 text-xs sm:h-8",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }
>(function Button(
  { variant = "primary", size = "md", loading, className = "", children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-ring disabled:cursor-not-allowed",
        variants[variant], sizes[size], className,
      ].join(" ")}
      {...rest}
    >
      {loading && (
        <span
          className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
});
