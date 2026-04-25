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
    <div className="min-h-[calc(100vh-0px)] bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="text-sm font-medium text-zinc-600">Student Notifier</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Sign in
            </h1>

          </div>

          <Card>
            <CardHeader>

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


        </div>
      </div>
    </div>
  );
}

