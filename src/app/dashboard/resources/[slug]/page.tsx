"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/auth-client";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size: string | null;
  createdTime: string | null;
  viewUrl: string;
  downloadUrl: string;
  thumbnailLink: string | null;
};

type DriveFolder = {
  id: string;
  name: string;
};

function formatSize(bytes: string | null) {
  if (!bytes) return null;
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeInfo(mimeType: string): {
  label: string;
  labelClass: string;
  iconColor: string;
  iconBg: string;
  iconRing: string;
} {
  if (mimeType === "application/pdf")
    return {
      label: "PDF",
      labelClass: "bg-red-50 text-red-700 ring-red-200/60",
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      iconRing: "ring-red-100",
    };
  if (mimeType.startsWith("video/"))
    return {
      label: "Video",
      labelClass: "bg-purple-50 text-purple-700 ring-purple-200/60",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      iconRing: "ring-purple-100",
    };
  if (mimeType.startsWith("image/"))
    return {
      label: "Image",
      labelClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      iconRing: "ring-emerald-100",
    };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return {
      label: "Sheet",
      labelClass: "bg-green-50 text-green-700 ring-green-200/60",
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      iconRing: "ring-green-100",
    };
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return {
      label: "Slides",
      labelClass: "bg-orange-50 text-orange-700 ring-orange-200/60",
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
      iconRing: "ring-orange-100",
    };
  if (mimeType.includes("document") || mimeType.includes("word"))
    return {
      label: "Doc",
      labelClass: "bg-blue-50 text-blue-700 ring-blue-200/60",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      iconRing: "ring-blue-100",
    };
  return {
    label: "File",
    labelClass: "bg-slate-50 text-slate-600 ring-slate-200/60",
    iconColor: "text-slate-500",
    iconBg: "bg-slate-50",
    iconRing: "ring-slate-100",
  };
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 9l5-2v10l-5-2V9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3v13M7 11l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M1 12C1 12 5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileTypeIcon({
  mimeType,
  className,
}: {
  mimeType: string;
  className?: string;
}) {
  if (mimeType.startsWith("video/")) return <VideoIcon className={className} />;
  if (mimeType.startsWith("image/")) return <ImageIcon className={className} />;
  return <FileIcon className={className} />;
}

export default function ResourceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const [folderName, setFolderName] = React.useState<string>("");
  const [files, setFiles] = React.useState<DriveFile[]>([]);
  const [subfolders, setSubfolders] = React.useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch<{ ok: true; folderName: string; files: DriveFile[]; subfolders: DriveFolder[] }>(
      `/api/resources/files?folderId=${slug}`
    )
      .then((res) => {
        setFolderName(res.folderName);
        setFiles(res.files);
        setSubfolders(res.subfolders ?? []);
      })
      .catch((e: any) => setError(e?.message || "Failed to load files"))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {folderName || (isLoading ? " " : "Resources")}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            View and download files in this category.
          </p>
        </div>
        <Link
          href="/dashboard/resources"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 hover:shadow"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All Resources
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <>
          {subfolders.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Subfolders
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subfolders.map((sf) => (
                  <Link
                    key={sf.id}
                    href={`/dashboard/resources/${sf.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md hover:ring-1 hover:ring-indigo-200/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 group-hover:bg-indigo-100">
                      <FolderIcon className="h-4 w-4" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 group-hover:text-indigo-700">
                      {sf.name}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {files.length === 0 && subfolders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <FileIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">
                No files available in this category yet.
              </p>
            </div>
          ) : files.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {files.map((f) => {
              const info = fileTypeInfo(f.mimeType);
              const size = formatSize(f.size);
              const date = f.createdTime
                ? new Date(f.createdTime).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <li
                  key={f.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70"
                >
                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                      info.iconBg,
                      info.iconColor,
                      info.iconRing,
                    ].join(" ")}
                  >
                    <FileTypeIcon mimeType={f.mimeType} className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {f.name}
                      </span>
                      <span
                        className={[
                          "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                          info.labelClass,
                        ].join(" ")}
                      >
                        {info.label}
                      </span>
                    </div>
                    {(size || date) && (
                      <div className="mt-0.5 text-xs text-slate-400">
                        {[size, date].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={f.viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 hover:shadow"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      View
                    </a>
                    <a
                      href={f.downloadUrl}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/30"
                    >
                      <DownloadIcon className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
          ) : null}
        </>
      )}
    </div>
  );
}
