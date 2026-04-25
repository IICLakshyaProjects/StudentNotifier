"use client";

import * as React from "react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/auth-client";

type SendResponse = {
  ok: boolean;
  message: { id: string; status: "sent" | "failed" };
  errors: string[];
};

export function SendPanel() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [form, setForm] = React.useState({
    studentName: "",
    email: "",
    whatsapp: "",
    campus: "",
    date: "",
    time: "",
    location: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<SendResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const res = await apiFetch<SendResponse>("/api/message/send", {
        method: "POST",
        json: form,
      });
      setResult(res);
      if (res.ok) setIsOpen(false);
    } catch (err: any) {
      setError(err?.message || "Send failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Send invite</div>
            <div className="mt-1 text-sm text-slate-600">
              Fill in the details and we’ll notify the student/parent.
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? "Hide form" : "Show form"}
          </Button>
        </div>

        <div className="p-4">
          {!isOpen ? (
            <div className="text-sm text-slate-600">
              Form hidden. Click “Show form” to send another invite.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Student name"
                value={form.studentName}
                onChange={(e) =>
                  setForm({ ...form, studentName: e.target.value })
                }
              />
              <Input
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                inputMode="email"
              />
              <Input
                label="Phone number"
                value={form.whatsapp}
                onChange={(e) =>
                  setForm({ ...form, whatsapp: e.target.value })
                }
                hint="Include country code if needed"
              />
              <Input
                label="Campus"
                value={form.campus}
                onChange={(e) => setForm({ ...form, campus: e.target.value })}
              />
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <Input
                label="Time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Location link"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="https://…"
                />
              </div>

              <div className="sm:col-span-2 mt-2 flex flex-wrap items-center gap-3">
                <Button type="submit" isLoading={isLoading}>
                  Send
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setForm({
                      studentName: "",
                      email: "",
                      whatsapp: "",
                      campus: "",
                      date: "",
                      time: "",
                      location: "",
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="border-b border-slate-200/70 p-4">
          <div className="text-sm font-semibold text-slate-900">Status</div>
          <div className="mt-1 text-xs text-slate-500">
            If something fails, you’ll see why here.
          </div>
        </div>
        <div className="p-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : result ? (
            <div className="space-y-2">
              <div className="text-sm text-slate-900">
                Result:{" "}
                <span
                  className={[
                    "font-medium",
                    result.ok ? "text-emerald-700" : "text-red-700",
                  ].join(" ")}
                >
                  {result.message.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                ID: {result.message.id}
              </div>
              {result.errors?.length ? (
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-600">Sent successfully.</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-600">Ready when you are.</div>
          )}
        </div>
      </section>
    </div>
  );
}

