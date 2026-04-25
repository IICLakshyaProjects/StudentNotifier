"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { apiFetch } from "@/lib/auth-client";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    apiFetch<{ ok: true; user: { role: string } }>("/api/auth/me", {
      method: "GET",
    })
      .then((res) => {
        if (res.user.role !== "admin") throw new Error("not admin");
        setReady(true);
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(56,189,248,0.12),transparent_55%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
      {!ready ? (
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6">
          <div className="text-sm text-slate-600">Loading…</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

