"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/IconButton";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/auth-client";

type CampusDto = {
  _id: string;
  name: string;
  slug: string;
  enabled: boolean;
  order: number;
  nextSequence: number;
  createdAt?: string;
};

type ListResponse = { ok: true; campuses: CampusDto[] };
type MutResponse = { ok: true; campus: CampusDto };

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = React.useState<CampusDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const [createForm, setCreateForm] = React.useState({
    name: "",
    slug: "",
    enabled: true,
    order: 0,
  });

  const [editing, setEditing] = React.useState<CampusDto | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: "",
    slug: "",
    enabled: true,
    order: 0,
    nextSequence: 1,
  });

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiFetch<ListResponse>("/api/admin/campuses", { method: "GET" });
      setCampuses(res.campuses || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load campuses");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function createCampus() {
    setError(null);
    try {
      const payload = {
        ...createForm,
        slug: toSlug(createForm.slug || createForm.name),
      };
      const res = await apiFetch<MutResponse>("/api/admin/campuses", {
        method: "POST",
        json: payload,
      });
      showToast("Campus created");
      setCreateForm({ name: "", slug: "", enabled: true, order: 0 });
      setCampuses((prev) => [...prev, res.campus].sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      const payload = {
        ...editForm,
        slug: toSlug(editForm.slug || editForm.name),
      };
      const res = await apiFetch<MutResponse>(`/api/admin/campuses/${editing._id}`, {
        method: "PATCH",
        json: payload,
      });
      showToast("Campus updated");
      setCampuses((prev) => prev.map((c) => (c._id === editing._id ? res.campus : c)).sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name)));
      setEditing(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function deleteCampus(id: string) {
    if (!confirm("Delete this campus?")) return;
    setError(null);
    try {
      await apiFetch(`/api/admin/campuses/${id}`, { method: "DELETE" });
      showToast("Campus deleted");
      setCampuses((prev) => prev.filter((c) => c._id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">Campuses</div>
          <div className="mt-1 text-sm text-slate-600">Manage campus dropdown options.</div>
        </div>
        <Button type="button" variant="secondary" onClick={load} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="text-sm font-semibold text-slate-900">Create campus</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Campus name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((s) => ({ ...s, name: e.target.value, slug: s.slug ? s.slug : toSlug(e.target.value) }))
            }
            placeholder="e.g. Kochi"
          />
          <Input
            label="Slug"
            value={createForm.slug}
            onChange={(e) => setCreateForm((s) => ({ ...s, slug: e.target.value }))}
            hint="Used for ID generation"
            placeholder="e.g. kochi"
          />
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
            <div className="text-xs font-semibold text-slate-700">Options</div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.enabled}
                  onChange={(e) => setCreateForm((s) => ({ ...s, enabled: e.target.checked }))}
                />
                Enabled
              </label>
            </div>
            <div className="mt-4">
              <Input
                label="Order"
                type="number"
                value={String(createForm.order)}
                onChange={(e) => setCreateForm((s) => ({ ...s, order: Number(e.target.value) }))}
                hint="Lower shows first"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={createCampus} disabled={!createForm.name.trim()}>
            Create
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Existing campuses</div>
          <div className="text-xs text-slate-500">{campuses.length} total</div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Slug</th>
                <th className="py-2 pr-4">Enabled</th>
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Next ID</th>
                <th className="py-2 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {isLoading ? (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : campuses.length ? (
                campuses.map((c) => (
                  <tr key={c._id} className="text-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-900">{c.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-600">{c.slug}</td>
                    <td className="py-3 pr-4">{c.enabled ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4">{c.order}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-600">
                      {String(c.nextSequence || 1).padStart(5, "0")}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          title="Edit"
                          size="sm"
                          onClick={() => {
                            setEditing(c);
                            setEditForm({
                              name: c.name,
                              slug: c.slug,
                              enabled: c.enabled,
                              order: c.order,
                              nextSequence: c.nextSequence || 1,
                            });
                          }}
                        >
                          <PencilIcon />
                        </IconButton>
                        <IconButton title="Delete" size="sm" variant="danger" onClick={() => deleteCampus(c._id)}>
                          <TrashIcon />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={6}>
                    No campuses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-slate-900">Edit campus</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="Campus name"
                value={editForm.name}
                onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
              />
              <Input
                label="Slug"
                value={editForm.slug}
                onChange={(e) => setEditForm((s) => ({ ...s, slug: e.target.value }))}
              />

              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 md:col-span-2">
                <div className="text-xs font-semibold text-slate-700">Options</div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-700">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.enabled}
                      onChange={(e) => setEditForm((s) => ({ ...s, enabled: e.target.checked }))}
                    />
                    Enabled
                  </label>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Order"
                    type="number"
                    value={String(editForm.order)}
                    onChange={(e) => setEditForm((s) => ({ ...s, order: Number(e.target.value) }))}
                  />
                  <Input
                    label="Next ID number"
                    type="number"
                    value={String(editForm.nextSequence)}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        nextSequence: Math.max(1, Number(e.target.value || 1)),
                      }))
                    }
                    hint="Next 5-digit number for this campus"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEdit}>
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

