"use client";

import * as React from "react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/auth-client";

type MessageItem = {
  id: string;
  studentName: string;
  parentName?: string;
  email: string;
  phone: string;
  campus?: string;
  date?: string;
  time?: string;
  status: "pending" | "sent" | "failed";
  createdAt: string;
};

type MessagesResponse = {
  ok: true;
  items: MessageItem[];
  page: number;
  limit: number;
  total: number;
};

function Pager({
  page,
  limit,
  total,
  onPage,
}: {
  page: number;
  limit: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        Page <span className="font-medium text-slate-700">{page}</span> of{" "}
        <span className="font-medium text-slate-700">{totalPages}</span> ·{" "}
        <span className="font-medium text-slate-700">{total}</span> total
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"" | "pending" | "sent" | "failed">(
    ""
  );
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  const [items, setItems] = React.useState<MessageItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function load(p = page) {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      params.set("page", String(p));
      params.set("limit", String(limit));
      const res = await apiFetch<MessagesResponse>(
        `/api/admin/messages?${params.toString()}`,
        { method: "GET" }
      );
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (e: any) {
      setError(e?.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            Message management
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Search and review message activity.
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {isLoading ? "Loading…" : `Showing ${items.length} results`}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
          <Input
            label="Search"
            placeholder="Student / parent / email / phone / campus"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="block">
            <div className="mb-1.5 text-sm font-medium text-slate-900">
              Status
            </div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm shadow-slate-900/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </label>
          <div className="md:pb-[2px]">
            <Button
              type="button"
              variant="secondary"
              isLoading={isLoading}
              onClick={() => load(1)}
              className="w-full md:w-auto"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/50 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Campus</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-white/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {m.studentName}
                    </div>
                    {m.parentName ? (
                      <div className="text-xs text-slate-500">
                        {m.parentName}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{m.email}</td>
                  <td className="px-4 py-3 text-slate-700">{m.phone}</td>
                  <td className="px-4 py-3 text-slate-700">{m.campus || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {(m.date || "—") + " · " + (m.time || "—")}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{m.status}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !isLoading ? (
                <tr>
                  <td className="px-4 py-10 text-sm text-slate-600" colSpan={7}>
                    No messages found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200/70 bg-white/40 p-4">
          <Pager page={page} limit={limit} total={total} onPage={(p) => load(p)} />
        </div>
      </div>
    </div>
  );
}

