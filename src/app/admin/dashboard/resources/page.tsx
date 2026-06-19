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
  fileCount: number;
};

const DEFAULT_CATEGORY_NAMES = [
  "Brochures",
  "Incepta Videos",
  "Lakshya Activities",
  "Pass %",
  "Pre-Placement",
  "Results Posters",
  "Testimonials",
];

// ── Category card ──────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  onEdit,
  onDelete,
}: {
  cat: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur transition-all hover:bg-white/90 hover:shadow-md">
      <Link
        href={`/admin/dashboard/resources/${cat._id}`}
        className="flex flex-1 flex-col p-5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="text-base font-semibold text-slate-900 leading-snug">
            {cat.name}
          </div>
          <span
            className={[
              "mt-0.5 shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              cat.enabled
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
                : "bg-slate-100 text-slate-500 ring-1 ring-slate-200/60",
            ].join(" ")}
          >
            {cat.enabled ? "Active" : "Disabled"}
          </span>
        </div>

        <div className="mt-1 font-mono text-xs text-slate-400">{cat.slug}</div>

        <div className="mt-5 flex items-end gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            {cat.fileCount}
          </span>
          <span className="mb-0.5 text-sm text-slate-500">
            {cat.fileCount === 1 ? "file" : "files"}
          </span>
        </div>

        <div className="mt-3 text-xs font-medium text-indigo-600 transition-colors group-hover:text-indigo-700">
          Manage files →
        </div>
      </Link>

      <div className="flex items-center justify-end gap-1 border-t border-slate-200/70 bg-white/40 px-3 py-2">
        <IconButton
          title="Edit category"
          size="sm"
          onClick={() => {
            onEdit();
          }}
        >
          <PencilIcon />
        </IconButton>
        <IconButton
          title="Delete category"
          size="sm"
          variant="danger"
          onClick={() => {
            onDelete();
          }}
        >
          <TrashIcon />
        </IconButton>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminResourcesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState("");
  const [newCatEnabled, setNewCatEnabled] = React.useState(true);
  const [newCatOrder, setNewCatOrder] = React.useState(0);
  const [isCreating, setIsCreating] = React.useState(false);

  // Edit modal
  const [editingCat, setEditingCat] = React.useState<Category | null>(null);
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

  async function loadCategories() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiFetch<{ ok: true; categories: Category[] }>(
        "/api/admin/resources/categories"
      );
      setCategories(res.categories);
    } catch (e: any) {
      const status = (e as any)?.status;
      if (status === 401 || status === 403) {
        setError("Access denied. Please log in as an admin at /admin/login.");
      } else {
        setError(e?.message || "Failed to load categories");
      }
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCategory() {
    if (!newCatName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const res = await apiFetch<{ ok: true; category: Category }>(
        "/api/admin/resources/categories",
        {
          method: "POST",
          json: {
            name: newCatName.trim(),
            enabled: newCatEnabled,
            order: newCatOrder,
          },
        }
      );
      setCategories((prev) =>
        [...prev, { ...res.category, fileCount: 0 }].sort(
          (a, b) => a.order - b.order || a.name.localeCompare(b.name)
        )
      );
      setNewCatName("");
      setNewCatOrder(0);
      setNewCatEnabled(true);
      setShowCreate(false);
      showToast("Category created");
    } catch (e: any) {
      setError(e?.message || "Failed to create category");
    } finally {
      setIsCreating(false);
    }
  }

  async function saveEdit() {
    if (!editingCat) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await apiFetch<{ ok: true; category: Category }>(
        `/api/admin/resources/categories/${editingCat._id}`,
        { method: "PATCH", json: editForm }
      );
      setCategories((prev) =>
        prev
          .map((c) =>
            c._id === editingCat._id
              ? { ...res.category, fileCount: editingCat.fileCount }
              : c
          )
          .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      );
      setEditingCat(null);
      showToast("Category updated");
    } catch (e: any) {
      setError(e?.message || "Failed to update category");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(cat: Category) {
    if (cat.fileCount > 0) {
      setError(
        `Cannot delete "${cat.name}" — it has ${cat.fileCount} file(s). Open the category and delete all files first.`
      );
      return;
    }
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`))
      return;
    setError(null);
    try {
      await apiFetch(`/api/admin/resources/categories/${cat._id}`, {
        method: "DELETE",
      });
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      showToast("Category deleted");
    } catch (e: any) {
      setError(e?.message || e?.data?.error || "Failed to delete category");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            Resources
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Select a category to manage its files, or add a new one.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loadCategories}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setShowCreate((v) => !v);
              setError(null);
            }}
          >
            {showCreate ? "Cancel" : "+ Add category"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Inline create form */}
      {showCreate ? (
        <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-5 backdrop-blur">
          <div className="mb-4 text-sm font-semibold text-slate-900">
            New category
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_120px_auto_auto] md:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Name
              </label>
              <input
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="e.g. Brochures"
                value={newCatName}
                autoFocus
                onChange={(e) => setNewCatName(e.target.value)}
                list="default-cat-names"
                onKeyDown={(e) => {
                  if (e.key === "Enter") createCategory();
                  if (e.key === "Escape") setShowCreate(false);
                }}
              />
              <datalist id="default-cat-names">
                {DEFAULT_CATEGORY_NAMES.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Order
              </label>
              <input
                type="number"
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                value={newCatOrder}
                onChange={(e) => setNewCatOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 md:pb-[2px]">
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={newCatEnabled}
                  onChange={(e) => setNewCatEnabled(e.target.checked)}
                />
                Enabled
              </label>
            </div>
            <div className="md:pb-[2px]">
              <Button
                type="button"
                size="sm"
                onClick={createCategory}
                isLoading={isCreating}
                disabled={!newCatName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Category grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center backdrop-blur">
          <div className="text-sm font-medium text-slate-600">
            No categories yet
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Click "+ Add category" above to create your first one.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id}
              cat={cat}
              onEdit={() => {
                setEditingCat(cat);
                setEditForm({
                  name: cat.name,
                  enabled: cat.enabled,
                  order: cat.order,
                });
              }}
              onDelete={() => deleteCategory(cat)}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingCat ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl">
            <div className="mb-1 text-lg font-semibold text-slate-900">
              Edit category
            </div>
            <div className="mb-4 font-mono text-xs text-slate-400">
              slug: {editingCat.slug}
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
                onClick={() => setEditingCat(null)}
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
