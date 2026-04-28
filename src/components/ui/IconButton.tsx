import * as React from "react";

export function IconButton({
  title,
  onClick,
  children,
  variant = "ghost",
  disabled,
  size = "md",
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "ghost" | "danger";
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const cls =
    variant === "danger"
      ? "text-red-700 hover:bg-red-50"
      : "text-slate-700 hover:bg-white/70";
  const sizeCls = size === "sm" ? "h-8 w-8 rounded-lg" : "h-9 w-9 rounded-xl";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center transition-colors disabled:opacity-60",
        sizeCls,
        cls,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

