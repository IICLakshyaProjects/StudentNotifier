import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Campus from "@/models/Campus";
import { requireRole } from "@/middleware/auth";

export const runtime = "nodejs";

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function normalizeSlug(input: unknown) {
  const raw = String(input ?? "").trim().toLowerCase();
  const cleaned = raw
    .replace(/[^a-z0-9 -]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const routeParams = await Promise.resolve(context.params);
  const id = routeParams?.id;
  if (!id) return badRequest("id is required");

  const body = await request.json().catch(() => null);
  const updates: any = {};
  if (body?.name !== undefined) updates.name = String(body.name).trim();
  if (body?.slug !== undefined) updates.slug = normalizeSlug(body.slug);
  if (body?.enabled !== undefined) updates.enabled = Boolean(body.enabled);
  if (body?.order !== undefined) {
    const o = Number(body.order);
    updates.order = Number.isFinite(o) ? o : 0;
  }
  if (body?.nextSequence !== undefined) {
    const n = Number(body.nextSequence);
    updates.nextSequence = Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }

  if (updates.name !== undefined && !updates.name) return badRequest("name is required");
  if (updates.slug !== undefined && !updates.slug) return badRequest("slug is required");

  await connectDB();
  try {
    const updated = await Campus.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, campus: updated });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate key") || e?.code === 11000) {
      return NextResponse.json({ error: "slug must be unique" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const routeParams = await Promise.resolve(context.params);
  const id = routeParams?.id;
  if (!id) return badRequest("id is required");

  await connectDB();
  const deleted = await Campus.findByIdAndDelete(id).lean();
  if (!deleted) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

