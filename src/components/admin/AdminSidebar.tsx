"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { apiFetch } from "@/lib/auth-client";

function Item({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "block rounded-2xl p-4 transition-all",
        active
          ? "bg-white/70 ring-1 ring-slate-200/70 shadow-sm shadow-slate-900/5"
          : "hover:bg-white/50",
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
    </Link>
  );
}

export function AdminSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen w-[280px] shrink-0 border-r border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="flex h-full flex-col p-4">
        <div className="px-2 py-3">
          <Image
            src="/BLUE.png"
            alt="Lakshya"
            width={220}
            height={44}
            priority
            className="h-8 w-auto select-none"
          />
          <div className="mt-3 rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/60">
            Admin Panel
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-2 px-1">
          <Item
            href="/admin/dashboard/users"
            title="Users"
            subtitle="Manage learner accounts"
          />
          <Item
            href="/admin/dashboard/fields"
            title="Fields"
            subtitle="Configure form fields"
          />
          <Item
            href="/admin/dashboard/messages"
            title="Messages"
            subtitle="Review message activity"
          />
        </nav>

        <div className="mt-4 space-y-3 px-1">
          <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-xs text-slate-500">
            Tip: Use search + filters to quickly find records.
          </div>
          <button
            type="button"
            onClick={() => {
              apiFetch("/api/auth/logout", { method: "POST" }).finally(() => {
                router.replace("/admin/login");
                router.refresh();
              });
            }}
            className="w-full rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm shadow-amber-500/20 hover:from-amber-300 hover:to-amber-500 active:from-amber-500 active:to-amber-600"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

