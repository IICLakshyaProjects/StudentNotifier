"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/auth-client";

type Category = {
  id: string;
  name: string;
  fileCount?: number;
};

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

type PanelContents = {
  folderId: string;
  folderName: string;
  files: DriveFile[];
  subfolders: DriveFolder[];
};

function formatSize(bytes: string | null) {
  if (!bytes) return null;
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeInfo(mimeType: string) {
  if (mimeType === "application/pdf")
    return { label: "PDF", color: "text-red-600", bg: "bg-red-50", ring: "ring-red-100", badge: "bg-red-50 text-red-700 ring-red-200/60" };
  if (mimeType.startsWith("video/"))
    return { label: "Video", color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-100", badge: "bg-purple-50 text-purple-700 ring-purple-200/60" };
  if (mimeType.startsWith("image/"))
    return { label: "Image", color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/60" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return { label: "Sheet", color: "text-green-600", bg: "bg-green-50", ring: "ring-green-100", badge: "bg-green-50 text-green-700 ring-green-200/60" };
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return { label: "Slides", color: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-100", badge: "bg-orange-50 text-orange-700 ring-orange-200/60" };
  if (mimeType.includes("document") || mimeType.includes("word"))
    return { label: "Doc", color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100", badge: "bg-blue-50 text-blue-700 ring-blue-200/60" };
  return { label: "File", color: "text-slate-500", bg: "bg-slate-50", ring: "ring-slate-100", badge: "bg-slate-50 text-slate-600 ring-slate-200/60" };
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type CopyStatus = "idle" | "copying" | "copied" | "failed";

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Unable to read image"));
    reader.readAsDataURL(blob);
  });
}

async function imageBlobToPngBlob(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");
    ctx.drawImage(bitmap, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error("Unable to prepare image for clipboard"));
      }, "image/png");
    });
  } finally {
    bitmap.close();
  }
}

async function copyPngBlobToClipboard(blob: Blob, fileName: string) {
  const ClipboardItemCtor = globalThis.ClipboardItem as typeof ClipboardItem | undefined;
  if (!ClipboardItemCtor || !navigator.clipboard?.write) {
    throw new Error("Clipboard image copy is not supported");
  }

  const pngBlob = blob.type === "image/png" ? blob : await imageBlobToPngBlob(blob);

  try {
    await navigator.clipboard.write([
      new ClipboardItemCtor({
        "image/png": pngBlob,
      }),
    ]);
    return;
  } catch {
    const dataUrl = await blobToDataUrl(pngBlob);
    await navigator.clipboard.write([
      new ClipboardItemCtor({
        "text/html": new Blob([`<img src="${dataUrl}" alt="${fileName.replace(/"/g, "&quot;")}">`], {
          type: "text/html",
        }),
        "text/plain": new Blob([fileName], { type: "text/plain" }),
      }),
    ]);
  }
}

async function fetchClipboardBlob(file: DriveFile, endpoint: "content" | "thumbnail" = "content") {
  const res = await fetch(
    `/api/resources/drive-files/${encodeURIComponent(file.id)}/${endpoint}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch file content");
  return await res.blob();
}

async function copyFileBlobToClipboard(file: DriveFile) {
  const blob = await fetchClipboardBlob(file);
  await copyPngBlobToClipboard(blob, file.name);
}


function CopyLinkButton({ file }: { file: DriveFile }) {
  const [status, setStatus] = React.useState<CopyStatus>("idle");

  const finishWithStatus = (nextStatus: CopyStatus) => {
    setStatus(nextStatus);
    window.setTimeout(() => setStatus("idle"), 2000);
  };

  const handleCopy = async () => {
    setStatus("copying");
    try {
      if (file.mimeType.startsWith("image/")) {
        await copyFileBlobToClipboard(file);
      } else {
        await navigator.clipboard.writeText(file.viewUrl);
      }
      finishWithStatus("copied");
    } catch (error) {
      console.error("[resources/copy]", error);
      finishWithStatus("failed");
    }
  };

  const isCopied = status === "copied";
  const isFailed = status === "failed";
  const isCopying = status === "copying";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isCopying}
      className={[
        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all",
        isCopied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : isFailed
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:shadow",
      ].join(" ")}
    >
      {isCopied ? (
        <>
          <CheckIcon className="h-3 w-3" />
          Copied
        </>
      ) : isFailed ? (
        <>
          <CopyIcon className="h-3 w-3" />
          Copy failed
        </>
      ) : isCopying ? (
        <>
          <CopyIcon className="h-3 w-3" />
          Copying
        </>
      ) : (
        <>
          <CopyIcon className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  );
}
function FileTypeIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith("video/")) return <VideoIcon className={className} />;
  if (mimeType.startsWith("image/")) return <ImageIcon className={className} />;
  return <FileIcon className={className} />;
}

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

function PanelColumn({
  title,
  loading,
  children,
  emptyMessage,
}: {
  title?: string;
  loading?: boolean;
  children?: React.ReactNode;
  emptyMessage?: string;
}) {
  return (
    <div className="flex min-w-[220px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonRows />
        ) : children ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <FolderIcon className="mb-2 h-8 w-8 text-slate-200" />
            <p className="text-xs text-slate-400">{emptyMessage ?? "Nothing here yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // The right-hand panel stack — each entry is a fetched folder's contents
  const [panels, setPanels] = React.useState<PanelContents[]>([]);
  const [panelLoadingId, setPanelLoadingId] = React.useState<string | null>(null);
  // Which folder is selected at each depth level (index = depth)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    apiFetch<{ ok: true; categories: Category[] }>("/api/resources/categories")
      .then((res) => setCategories(res.categories))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to load resources";
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const openFolder = (folderId: string, depth: number) => {
    // depth 0 = clicking a root category → opens panel[0]
    // depth 1 = clicking a subfolder in panel[0] → opens panel[1], etc.
    setSelectedIds((prev) => {
      const next = prev.slice(0, depth);
      next[depth] = folderId;
      return next;
    });
    // Truncate panels beyond this depth
    setPanels((prev) => prev.slice(0, depth));
    setPanelLoadingId(folderId);

    apiFetch<{ ok: true; folderName: string; files: DriveFile[]; subfolders: DriveFolder[] }>(
      `/api/resources/files?folderId=${folderId}`
    )
      .then((res) => {
        setPanels((prev) => {
          const next = prev.slice(0, depth);
          next[depth] = {
            folderId,
            folderName: res.folderName,
            files: res.files,
            subfolders: res.subfolders ?? [],
          };
          return next;
        });
      })
      .catch(() => {
        setPanels((prev) => prev.slice(0, depth));
      })
      .finally(() => setPanelLoadingId(null));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resources</h1>
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Explorer panels */}
      <div className="flex h-[calc(100vh-220px)] min-h-[380px] gap-3 overflow-x-auto pb-2">
        {/* Panel 0 — root categories */}
        <PanelColumn
          title="Categories"
          loading={isLoading}
          emptyMessage="No resource categories available yet."
        >
          {categories.length > 0 && (
            <ul className="divide-y divide-slate-50">
              {categories.map((cat) => {
                const isSelected = selectedIds[0] === cat.id;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => openFolder(cat.id, 0)}
                      className={[
                        "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "bg-indigo-50 text-indigo-700"
                          : "hover:bg-slate-50 text-slate-700",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors",
                          isSelected
                            ? "bg-indigo-100 text-indigo-600 ring-indigo-200"
                            : "bg-indigo-50 text-indigo-500 ring-indigo-100 group-hover:bg-indigo-100",
                        ].join(" ")}
                      >
                        <FolderIcon className="h-4 w-4" />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{cat.name}</span>
                      <ChevronRightIcon
                        className={[
                          "h-4 w-4 shrink-0 transition-colors",
                          isSelected ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400",
                        ].join(" ")}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelColumn>

        {/* Dynamically rendered right panels */}
        {panels.map((panel, depth) => {
          const hasContent = panel.subfolders.length > 0 || panel.files.length > 0;
          const isThisPanelLoading = panelLoadingId != null && selectedIds[depth] === panelLoadingId;

          return (
            <PanelColumn
              key={panel.folderId}
              title={panel.folderName}
              loading={isThisPanelLoading}
              emptyMessage="This folder is empty."
            >
              {hasContent && (
                <ul className="divide-y divide-slate-50">
                  {/* Subfolders first */}
                  {panel.subfolders.map((sf) => {
                    const isSelected = selectedIds[depth + 1] === sf.id;
                    return (
                      <li key={sf.id}>
                        <button
                          type="button"
                          onClick={() => openFolder(sf.id, depth + 1)}
                          className={[
                            "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                            isSelected
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-slate-50 text-slate-700",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors",
                              isSelected
                                ? "bg-indigo-100 text-indigo-600 ring-indigo-200"
                                : "bg-indigo-50 text-indigo-500 ring-indigo-100 group-hover:bg-indigo-100",
                            ].join(" ")}
                          >
                            <FolderIcon className="h-4 w-4" />
                          </div>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{sf.name}</span>
                          <ChevronRightIcon
                            className={[
                              "h-4 w-4 shrink-0 transition-colors",
                              isSelected ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400",
                            ].join(" ")}
                          />
                        </button>
                      </li>
                    );
                  })}

                  {/* Files */}
                  {panel.files.map((f) => {
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
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors"
                      >
                        <div
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                            info.bg,
                            info.color,
                            info.ring,
                          ].join(" ")}
                        >
                          <FileTypeIcon mimeType={f.mimeType} className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-slate-800">{f.name}</span>
                            <span
                              className={[
                                "inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1",
                                info.badge,
                              ].join(" ")}
                            >
                              {info.label}
                            </span>
                          </div>
                          {(size || date) && (
                            <div className="mt-0.5 text-xs text-slate-400">{[size, date].filter(Boolean).join(" · ")}</div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <a
                            href={f.viewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 hover:shadow"
                          >
                            <EyeIcon className="h-3 w-3" />
                            View
                          </a>
                          <a
                            href={f.downloadUrl}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500"
                          >
                            <DownloadIcon className="h-3 w-3" />
                            Save
                          </a>
                          <CopyLinkButton file={f} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </PanelColumn>
          );
        })}

        {/* Loading panel while a folder is being fetched */}
        {panelLoadingId != null && !panels.some((p) => p.folderId === panelLoadingId) && (
          <PanelColumn loading />
        )}
      </div>
    </div>
  );
}
