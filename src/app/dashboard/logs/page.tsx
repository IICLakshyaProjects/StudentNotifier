"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/auth-client";

type LogItem = {
  id: string;
  studentName: string;
  parentName?: string;
  email: string;
  whatsapp: string;
  campus?: string;
  date?: string;
  time?: string;
  location?: string;
  status: "pending" | "sent" | "failed";
  createdAt: string;
};

type LogsResponse = {
  ok: true;
  items: LogItem[];
};

function Pill({ status }: { status: LogItem["status"] }) {
  const cls =
    status === "sent"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "failed"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-zinc-50 text-zinc-700 border-zinc-200";
  return (
    <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", cls].join(" ")}>
      {status}
    </span>
  );
}

export default function LogsPage() {
  const [items, setItems] = React.useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<LogsResponse>("/api/message/logs?limit=50", {
        method: "GET",
      });
      setItems(res.items);
    } catch (err: any) {
      setError(err?.message || "Failed to load logs");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-zinc-900">Logs</div>
            <div className="mt-1 text-sm text-zinc-600">
              Latest messages you created, with delivery status.
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={load} isLoading={isLoading}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : isLoading ? (
          <div className="text-sm text-zinc-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-600">
            No messages yet. Try sending one from the Send page.
          </div>
        ) : (
          <div className="overflow-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Session</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-zinc-50/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900">{it.studentName}</div>
                      {it.parentName ? (
                        <div className="text-xs text-zinc-500">{it.parentName}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{it.email}</td>
                    <td className="px-4 py-3 text-zinc-700">{it.whatsapp}</td>
                    <td className="px-4 py-3 text-zinc-700">
                      <div className="text-xs text-zinc-500">{it.campus || "—"}</div>
                      <div>
                        {(it.date || "—") + " · " + (it.time || "—")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Pill status={it.status} />
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {new Date(it.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

