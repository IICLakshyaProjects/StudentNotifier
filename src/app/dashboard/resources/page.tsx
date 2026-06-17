"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/auth-client";

type Category = {
  id: string;
  name: string;
  fileCount?: number;
};

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResourcesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch<{ ok: true; categories: Category[] }>("/api/resources/categories")
      .then((res) => setCategories(res.categories))
      .catch((e: any) => setError(e?.message || "Failed to load resources"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resources
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Browse and download placement materials, videos, and more.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 hover:shadow"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <FolderIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            No resource categories available yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/resources/${cat.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:border-indigo-200 hover:shadow-md hover:ring-1 hover:ring-indigo-200/50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 transition-colors group-hover:bg-indigo-100">
                <FolderIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                  {cat.name}
                </div>
                {cat.fileCount !== undefined ? (
                  <div className="mt-0.5 text-xs text-slate-400">
                    {cat.fileCount === 1
                      ? "1 file"
                      : `${cat.fileCount} files`}
                  </div>
                ) : (
                  <div className="mt-0.5 text-xs font-medium text-indigo-500 group-hover:text-indigo-600">
                    View files
                  </div>
                )}
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
