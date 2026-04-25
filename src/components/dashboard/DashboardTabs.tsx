"use client";

import * as React from "react";

type Tab = "send" | "upload";

export function DashboardTabs({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  function TabButton({ id, label }: { id: Tab; label: string }) {
    const isActive = active === id;
    return (
      <button
        type="button"
        onClick={() => onChange(id)}
        className={[
          "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-white text-slate-900 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/70"
            : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
        ].join(" ")}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/40 p-2 ring-1 ring-slate-200/60 backdrop-blur">
      <TabButton id="send" label="Send" />
      <TabButton id="upload" label="Bulk upload" />
    </div>
  );
}

