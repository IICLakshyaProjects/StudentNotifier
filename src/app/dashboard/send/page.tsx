"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/auth-client";

type SendResponse = {
  ok: boolean;
  message: { id: string; status: "sent" | "failed" };
  errors: string[];
};

export default function SendPage() {
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
    } catch (err: any) {
      setError(err?.message || "Send failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold text-zinc-900">
            Send a single message
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            This will send WhatsApp and Email, and store the status in MongoDB.
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Student name"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            />
            <Input
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              inputMode="email"
            />
            <Input
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              hint="Include country code if needed"
            />
            <Input
              label="Campus"
              value={form.campus}
              onChange={(e) => setForm({ ...form, campus: e.target.value })}
            />
            <Input
              label="Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="Time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              placeholder="10:30 AM"
            />
            <div className="sm:col-span-2">
              <Input
                label="Location link"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="https://…"
              />
            </div>

            <div className="sm:col-span-2 mt-2 flex items-center gap-3">
              <Button type="submit" isLoading={isLoading}>
                Send now
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
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-medium text-zinc-900">Result</div>
            <div className="mt-1 text-xs text-zinc-500">
              You’ll see channel errors here if anything fails.
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : result ? (
              <div className="space-y-2">
                <div className="text-sm text-zinc-900">
                  Status:{" "}
                  <span
                    className={[
                      "font-medium",
                      result.ok ? "text-emerald-700" : "text-red-700",
                    ].join(" ")}
                  >
                    {result.message.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  Message ID: {result.message.id}
                </div>
                {result.errors?.length ? (
                  <ul className="mt-3 list-disc pl-5 text-sm text-zinc-700">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-zinc-600">
                    WhatsApp + Email sent successfully.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-zinc-600">
                Submit the form to send a message.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

