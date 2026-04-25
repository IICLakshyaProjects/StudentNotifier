import * as React from "react";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border border-zinc-200 bg-white shadow-sm",
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
    <div className={["px-6 pt-6", className || ""].join(" ")} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["px-6 pb-6", className || ""].join(" ")} {...props} />
  );
}

