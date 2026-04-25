"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/auth-client";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  React.useEffect(() => {
    apiFetch("/api/auth/me", { method: "GET" }).catch(() => {
      router.replace("/login");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(56,189,248,0.16),transparent_55%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-sm shadow-indigo-600/20" />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Student Notifier
              </div>
              <div className="text-xs text-slate-500">Notifications dashboard</div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              apiFetch("/api/auth/logout", { method: "POST" }).finally(() => {
                router.replace("/login");
                router.refresh();
              });
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

