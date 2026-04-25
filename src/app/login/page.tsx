"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/auth-client";

type LoginResponse = {
  user: { id: string; name: string; email: string; role: "admin" | "user" };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      router.push("/dashboard/send");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(56,189,248,0.18),transparent_55%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-sm shadow-indigo-600/20" />
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Student Notifier
                </div>
                <div className="text-xs text-slate-500">
                  Send WhatsApp + Email notifications
                </div>
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Use your account to message students and parents.
            </p>

          </div>

          <Card>
            <CardHeader>
              <div className="text-sm font-medium text-slate-900">Credentials</div>
              <div className="mt-1 text-xs text-slate-500">
                Session is stored in HTTP-only cookies.
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                  label="Email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Sign in
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-6 text-center text-xs text-slate-500">
            Admin? Use{" "}
            <a className="font-medium text-indigo-700 hover:text-indigo-800" href="/admin/login">
              /admin/login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

