"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/IconButton";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/auth-client";

type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "password"
  | "number"
  | "date"
  | "time";

type FieldDto = {
  _id: string;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  enabled: boolean;
  order: number;
  createdAt?: string;
};

type ListResponse = { ok: true; fields: FieldDto[] };
type MutResponse = { ok: true; field: FieldDto };

const TYPE_OPTIONS: Array<{ id: FieldType; label: string }> = [
  { id: "text", label: "Text" },
  { id: "email", label: "Email" },
  { id: "tel", label: "Phone" },
  { id: "url", label: "URL" },
  { id: "password", label: "Password" },
  { id: "number", label: "Number" },
  { id: "date", label: "Date" },
  { id: "time", label: "Time" },
];

function toKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ -]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function AdminFieldsPage() {
  const [fields, setFields] = React.useState<FieldDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const [createForm, setCreateForm] = React.useState({
    label: "",
    key: "",
    type: "text" as FieldType,
    required: false,
    enabled: true,
    order: 0,
  });

  const [editing, setEditing] = React.useState<FieldDto | null>(null);
  const [editForm, setEditForm] = React.useState({
    label: "",
    key: "",
    type: "text" as FieldType,
    required: false,
    enabled: true,
    order: 0,
  });

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiFetch<ListResponse>("/api/admin/fields", { method: "GET" });
      setFields(res.fields || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load fields");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function createField() {
    setError(null);
    try {
      const payload = {
        ...createForm,
        key: toKey(createForm.key || createForm.label),
      };
      const res = await apiFetch<MutResponse>("/api/admin/fields", {
        method: "POST",
        json: payload,
      });
      showToast("Field created");
      setCreateForm({
        label: "",
        key: "",
        type: "text",
        required: false,
        enabled: true,
        order: 0,
      });
      setFields((prev) => [...prev, res.field].sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label)));
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
        key: toKey(editForm.key || editForm.label),
      };
      const res = await apiFetch<MutResponse>(`/api/admin/fields/${editing._id}`, {
        method: "PATCH",
        json: payload,
      });
      showToast("Field updated");
      setFields((prev) => prev.map((f) => (f._id === editing._id ? res.field : f)).sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label)));
      setEditing(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function deleteField(id: string) {
    if (!confirm("Delete this field?")) return;
    setError(null);
    try {
      await apiFetch(`/api/admin/fields/${id}`, { method: "DELETE" });
      showToast("Field deleted");
      setFields((prev) => prev.filter((f) => f._id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">Fields</div>
          <div className="mt-1 text-sm text-slate-600">
            Configure additional inputs that appear in the send form and templates.
          </div>
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
        <div className="text-sm font-semibold text-slate-900">Create field</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Field name"
            value={createForm.label}
            onChange={(e) =>
              setCreateForm((s) => ({ ...s, label: e.target.value, key: s.key ? s.key : toKey(e.target.value) }))
            }
            placeholder="e.g. Username"
          />
          <Input
            label="Key"
            value={createForm.key}
            onChange={(e) => setCreateForm((s) => ({ ...s, key: e.target.value }))}
            hint="Used as column name in CSV and as identifier"
            placeholder="e.g. username"
          />

          <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
            <div className="text-xs font-semibold text-slate-700">Type</div>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={createForm.type}
              onChange={(e) => setCreateForm((s) => ({ ...s, type: e.target.value as FieldType }))}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
            <div className="text-xs font-semibold text-slate-700">Options</div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.required}
                  onChange={(e) => setCreateForm((s) => ({ ...s, required: e.target.checked }))}
                />
                Required
              </label>
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
          <Button type="button" onClick={createField} disabled={!createForm.label.trim()}>
            Create
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Existing fields</div>
          <div className="text-xs text-slate-500">{fields.length} total</div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Label</th>
                <th className="py-2 pr-4">Key</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Required</th>
                <th className="py-2 pr-4">Enabled</th>
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {isLoading ? (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={7}>
                    Loading…
                  </td>
                </tr>
              ) : fields.length ? (
                fields.map((f) => (
                  <tr key={f._id} className="text-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-900">{f.label}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-600">{f.key}</td>
                    <td className="py-3 pr-4">{f.type}</td>
                    <td className="py-3 pr-4">{f.required ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4">{f.enabled ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4">{f.order}</td>
                    <td className="py-3 pr-2">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          title="Edit"
                          onClick={() => {
                            setEditing(f);
                            setEditForm({
                              label: f.label,
                              key: f.key,
                              type: f.type,
                              required: f.required,
                              enabled: f.enabled,
                              order: f.order,
                            });
                          }}
                        >
                          <PencilIcon />
                        </IconButton>
                        <IconButton title="Delete" variant="danger" onClick={() => deleteField(f._id)}>
                          <TrashIcon />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={7}>
                    No fields yet.
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
            <div className="text-lg font-semibold text-slate-900">Edit field</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="Field name"
                value={editForm.label}
                onChange={(e) => setEditForm((s) => ({ ...s, label: e.target.value }))}
              />
              <Input
                label="Key"
                value={editForm.key}
                onChange={(e) => setEditForm((s) => ({ ...s, key: e.target.value }))}
              />

              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 md:col-span-2">
                <div className="text-xs font-semibold text-slate-700">Type</div>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  value={editForm.type}
                  onChange={(e) => setEditForm((s) => ({ ...s, type: e.target.value as FieldType }))}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 md:col-span-2">
                <div className="text-xs font-semibold text-slate-700">Options</div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-700">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.required}
                      onChange={(e) => setEditForm((s) => ({ ...s, required: e.target.checked }))}
                    />
                    Required
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.enabled}
                      onChange={(e) => setEditForm((s) => ({ ...s, enabled: e.target.checked }))}
                    />
                    Enabled
                  </label>
                </div>
                <div className="mt-4">
                  <Input
                    label="Order"
                    type="number"
                    value={String(editForm.order)}
                    onChange={(e) => setEditForm((s) => ({ ...s, order: Number(e.target.value) }))}
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

