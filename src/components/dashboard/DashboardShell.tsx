"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/auth-client";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  React.useEffect(() => {
    apiFetch("/api/auth/me", { method: "GET" }).catch(() => {
      router.replace("/login");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-zinc-900" />
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                Student Notifier
              </div>
              <div className="text-xs text-zinc-500">
                WhatsApp + Email messaging
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="/dashboard/send" label="Send" />
            <NavLink href="/dashboard/upload" label="Bulk Upload" />
         
          </nav>

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

