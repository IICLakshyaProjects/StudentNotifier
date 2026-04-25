import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  isLoading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800",
  secondary:
    "bg-white/75 text-slate-900 border border-slate-200/70 hover:bg-white active:bg-slate-50 backdrop-blur",
  danger:
    "bg-gradient-to-b from-red-600 to-red-700 text-white shadow-sm shadow-red-600/15 hover:from-red-500 hover:to-red-700 active:from-red-700 active:to-red-800",
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

