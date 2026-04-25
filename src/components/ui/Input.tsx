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
        <div className="mb-1.5 text-sm font-medium text-zinc-900">{label}</div>
      ) : null}
      <input
        className={[
          "h-11 w-full rounded-xl border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400",
          error ? "border-red-300 focus:ring-red-200" : "border-zinc-200",
          "focus:outline-none focus:ring-2",
          className || "",
        ].join(" ")}
        {...props}
      />
      {error ? (
        <div className="mt-1 text-xs text-red-600">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-xs text-zinc-500">{hint}</div>
      ) : null}
    </label>
  );
}

