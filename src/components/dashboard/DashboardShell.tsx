"use client";

import Image from "next/image";
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/BLUE.png"
              alt="Lakshya"
              width={220}
              height={44}
              priority
              className="h-8 w-auto select-none"
            />
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

      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

