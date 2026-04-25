import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  isLoading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-sm",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100",
  danger:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-sm",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        base,
        variants[variant],
        sizes[size],
        className || "",
      ].join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>Working…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

