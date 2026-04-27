"use client";

import * as React from "react";
import Image from "next/image";
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
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <Image
                  src="/BLUE.png"
                  alt="Lakshya"
                  width={320}
                  height={64}
                  priority
                  className="h-12 w-auto select-none"
                />
              </div>
              <div className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                Sign in
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Welcome back. Please enter your details.
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

                <div className="relative py-2">
                  <div className="h-px w-full bg-slate-200/70" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/70 px-2 text-xs text-slate-500">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-center border border-slate-200/80 bg-white/80 text-slate-900 hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/25"
                  onClick={() => {
                    window.location.href =
                      "/api/auth/google/start?returnTo=" +
                      encodeURIComponent("/dashboard");
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.72 1.22 9.23 3.6l6.9-6.9C35.94 2.38 30.36 0 24 0 14.62 0 6.54 5.38 2.56 13.22l8.02 6.23C12.46 13.12 17.77 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.5 24c0-1.64-.15-3.22-.43-4.74H24v9.02h12.6c-.54 2.9-2.16 5.36-4.6 7.02l7.05 5.47C43.58 36.54 46.5 30.84 46.5 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.58 28.45A14.5 14.5 0 0 1 9.8 24c0-1.54.27-3.02.78-4.45l-8.02-6.23A23.95 23.95 0 0 0 0 24c0 3.87.92 7.53 2.56 10.78l8.02-6.33z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.36 0 11.7-2.1 15.6-5.72l-7.05-5.47c-1.96 1.32-4.47 2.1-8.55 2.1-6.23 0-11.54-3.62-13.42-8.95l-8.02 6.33C6.54 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    <span>Continue with Google</span>
                  </span>
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

