"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/IconButton";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/auth-client";

type Category = {
  _id: string;
  name: string;
  slug: string;
  enabled: boolean;
  order: number;
  fileCount?: number;
};

type ResourceFile = {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeBadge({ mimeType }: { mimeType: string }) {
  const isVideo = mimeType.startsWith("video/");
  return (
    <span
      className={[
        "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isVideo
          ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200/60"
          : "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
      ].join(" ")}
    >
      {isVideo ? "Video" : "PDF"}
    </span>
  );
}

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = React.use(params);

  const [category, setCategory] = React.useState<Category | null>(null);
  const [files, setFiles] = React.useState<ResourceFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  // Upload
  const [uploadName, setUploadName] = React.useState("");
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Edit category
  const [showEdit, setShowEdit] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: "",
    enabled: true,
    order: 0,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function loadFiles() {
    const res = await apiFetch<{ ok: true; files: ResourceFile[] }>(
      `/api/admin/resources/files?categoryId=${categoryId}`
    );
    setFiles(res.files);
  }

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [catRes, filesRes] = await Promise.all([
          apiFetch<{ ok: true; category: Category }>(
            `/api/admin/resources/categories/${categoryId}`
          ),
          apiFetch<{ ok: true; files: ResourceFile[] }>(
            `/api/admin/resources/files?categoryId=${categoryId}`
          ),
        ]);
        setCategory(catRes.category);
        setFiles(filesRes.files);
      } catch (e: any) {
        const status = (e as any)?.status;
        if (status === 401 || status === 403) {
          setError("Access denied. Please log in as an admin at /admin/login.");
        } else if (status === 404) {
          setError("Category not found.");
        } else {
          setError(e?.message || "Failed to load data");
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [categoryId]);

  async function uploadFileToCategory() {
    if (!uploadName.trim() || !uploadFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("categoryId", categoryId);
      form.append("name", uploadName.trim());
      form.append("file", uploadFile);

      const res = await fetch("/api/admin/resources/files", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          "Access denied. Please ensure you are logged in as an admin at /admin/login."
        );
      }
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      setUploadFile(null);
      setUploadName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("File uploaded");
      await loadFiles();
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this file permanently? This cannot be undone.")) return;
    setError(null);
    try {
      await apiFetch(`/api/admin/resources/files/${id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((f) => f._id !== id));
      showToast("File deleted");
    } catch (e: any) {
      setError(e?.message || "Failed to delete file");
    }
  }

  async function saveEdit() {
    if (!category) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await apiFetch<{ ok: true; category: Category }>(
        `/api/admin/resources/categories/${categoryId}`,
        { method: "PATCH", json: editForm }
      );
      setCategory((prev) =>
        prev ? { ...res.category, fileCount: prev.fileCount } : res.category
      );
      setShowEdit(false);
      showToast("Category updated");
    } catch (e: any) {
      setError(e?.message || "Failed to update category");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-3 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (error && !category) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/dashboard/resources"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          ← Resources
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-1.5 text-sm">
            <Link
              href="/admin/dashboard/resources"
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              Resources
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700">{category?.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-2xl font-semibold tracking-tight text-slate-900">
              {category?.name}
            </div>
            <span
              className={[
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                category?.enabled
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
                  : "bg-slate-100 text-slate-500 ring-1 ring-slate-200/60",
              ].join(" ")}
            >
              {category?.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="mt-0.5 font-mono text-xs text-slate-400">
            {category?.slug}
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!category) return;
            setShowEdit(true);
            setEditForm({
              name: category.name,
              enabled: category.enabled,
              order: category.order,
            });
          }}
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Edit category
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Upload section */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="mb-4 text-sm font-semibold text-slate-900">
          Upload to {category?.name}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Display name
            </label>
            <input
              className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="e.g. 2024 Brochure"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && uploadFile) uploadFileToCategory();
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              File (PDF / Video)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.mp4,.webm,.mov,.avi,.mkv,video/*,application/pdf"
              className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)] file:mr-2 file:rounded file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-indigo-700"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="md:pb-[2px]">
            <Button
              type="button"
              onClick={uploadFileToCategory}
              isLoading={isUploading}
              disabled={!uploadName.trim() || !uploadFile}
            >
              Upload
            </Button>
          </div>
        </div>
        {uploadFile ? (
          <div className="mt-2 text-xs text-slate-400">
            Selected:{" "}
            <span className="font-medium text-slate-600">{uploadFile.name}</span>{" "}
            ({formatSize(uploadFile.size)})
          </div>
        ) : null}
      </section>

      {/* Files list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/50 px-5 py-3">
          <div className="text-sm font-semibold text-slate-900">
            Uploaded files
          </div>
          <div className="text-xs text-slate-400">
            {files.length} {files.length === 1 ? "file" : "files"}
          </div>
        </div>

        {files.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            No files yet — upload the first one above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200/70">
            {files.map((f) => (
              <li
                key={f._id}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">
                      {f.name}
                    </span>
                    <FileTypeBadge mimeType={f.mimeType} />
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-400">
                    {f.originalName} · {formatSize(f.size)} ·{" "}
                    {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={`/api/resources/files/${f._id}/content`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-lg border border-slate-200/70 bg-white/75 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur transition-all hover:bg-white"
                  >
                    View
                  </a>
                  <IconButton
                    title="Delete file"
                    size="sm"
                    variant="danger"
                    onClick={() => deleteFile(f._id)}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit category modal */}
      {showEdit && category ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl">
            <div className="mb-1 text-lg font-semibold text-slate-900">
              Edit category
            </div>
            <div className="mb-4 font-mono text-xs text-slate-400">
              slug: {category.slug}
            </div>
            <div className="space-y-4">
              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((s) => ({ ...s, name: e.target.value }))
                }
              />
              <Input
                label="Order"
                type="number"
                hint="Lower number shows first"
                value={String(editForm.order)}
                onChange={(e) =>
                  setEditForm((s) => ({
                    ...s,
                    order: Number(e.target.value),
                  }))
                }
              />
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editForm.enabled}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, enabled: e.target.checked }))
                  }
                />
                Enabled (visible to users)
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEdit(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="button" onClick={saveEdit} isLoading={isSaving}>
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
