"use client";

import * as React from "react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/auth-client";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
};

type UsersResponse = {
  ok: true;
  items: UserItem[];
  page: number;
  limit: number;
  total: number;
};

function Pager({
  page,
  limit,
  total,
  onPage,
}: {
  page: number;
  limit: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        Page <span className="font-medium text-slate-700">{page}</span> of{" "}
        <span className="font-medium text-slate-700">{totalPages}</span> ·{" "}
        <span className="font-medium text-slate-700">{total}</span> total
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState<"" | "admin" | "user">("");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  const [items, setItems] = React.useState<UserItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [editing, setEditing] = React.useState<UserItem | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    password: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  async function load(p = page) {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (role) params.set("role", role);
      params.set("page", String(p));
      params.set("limit", String(limit));
      const res = await apiFetch<UsersResponse>(
        `/api/admin/users?${params.toString()}`,
        { method: "GET" }
      );
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(id: string) {
    const ok = window.confirm("Delete this user? This cannot be undone.");
    if (!ok) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      await load(1);
    } catch (e: any) {
      setError(e?.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(u: UserItem) {
    setEditing(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, password: "" });
  }

  async function saveEdit() {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        json: {
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          password: editForm.password || undefined, // blank keeps old password
        },
      });
      setEditing(null);
      await load(page);
    } catch (e: any) {
      setError(e?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            User management
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Search, edit, and delete accounts.
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {isLoading ? "Loading…" : `Showing ${items.length} results`}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
          <Input
            label="Search"
            placeholder="Name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="block">
            <div className="mb-1.5 text-sm font-medium text-slate-900">Role</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm shadow-slate-900/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>
          <div className="md:pb-[2px]">
            <Button
              type="button"
              variant="secondary"
              isLoading={isLoading}
              onClick={() => load(1)}
              className="w-full md:w-auto"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/50 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-white/60">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3 text-slate-700">{u.role}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <IconButton title="Edit user" onClick={() => openEdit(u)}>
                        <PencilIcon className="h-5 w-5" />
                      </IconButton>
                      <IconButton
                        title="Delete user"
                        variant="danger"
                        onClick={() => onDelete(u.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !isLoading ? (
                <tr>
                  <td className="px-4 py-10 text-sm text-slate-600" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200/70 bg-white/40 p-4">
          <Pager page={page} limit={limit} total={total} onPage={(p) => load(p)} />
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-xl backdrop-blur">
            <div className="text-lg font-semibold text-slate-900">Edit user</div>
            <div className="mt-1 text-sm text-slate-600">
              Leave password blank to keep the existing password.
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <Input
                label="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                inputMode="email"
              />
              <label className="block">
                <div className="mb-1.5 text-sm font-medium text-slate-900">
                  Role
                </div>
                <select
                  className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm shadow-slate-900/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value as any })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <Input
                label="Password (optional)"
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                placeholder="Leave blank to keep current"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="button" onClick={saveEdit} isLoading={isSaving}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

