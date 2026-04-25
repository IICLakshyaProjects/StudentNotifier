import * as React from "react";

export function IconButton({
  title,
  onClick,
  children,
  variant = "ghost",
  disabled,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "ghost" | "danger";
  disabled?: boolean;
}) {
  const cls =
    variant === "danger"
      ? "text-red-700 hover:bg-red-50"
      : "text-slate-700 hover:bg-white/70";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-60",
        cls,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

