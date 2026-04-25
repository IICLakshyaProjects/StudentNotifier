import * as React from "react";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm shadow-slate-900/5 backdrop-blur",
        className || "",
      ].join(" ")}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["px-6 pt-6", className || ""].join(" ")}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["px-6 pb-6", className || ""].join(" ")}
      {...props}
    />
  );
}

