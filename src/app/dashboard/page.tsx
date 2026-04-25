"use client";

import * as React from "react";

import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SendPanel } from "@/components/dashboard/SendPanel";
import { UploadPanel } from "@/components/dashboard/UploadPanel";

type Tab = "send" | "upload";

function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "send";
  const tab = new URL(window.location.href).searchParams.get("tab");
  return tab === "upload" ? "upload" : "send";
}

export default function DashboardPage() {
  const [tab, setTab] = React.useState<Tab>("send");

  React.useEffect(() => {
    setTab(getTabFromUrl());
  }, []);

  function setTabAndUrl(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Choose an action to get started.
          </div>
        </div>
        <DashboardTabs active={tab} onChange={setTabAndUrl} />
      </div>

      {tab === "send" ? <SendPanel /> : <UploadPanel />}
    </div>
  );
}

