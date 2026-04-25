import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1.5 text-sm font-medium text-slate-900">
          {label}
        </div>
      ) : null}
      <input
        className={[
          "h-11 w-full rounded-xl border bg-white/80 px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm shadow-slate-900/5 backdrop-blur",
          error
            ? "border-red-300 focus:ring-red-200"
            : "border-slate-200/80 focus:ring-[var(--ring)]",
          "focus:outline-none focus:ring-2",
          className || "",
        ].join(" ")}
        {...props}
      />
      {error ? (
        <div className="mt-1 text-xs text-red-600">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-xs text-slate-500">{hint}</div>
      ) : null}
    </label>
  );
}

