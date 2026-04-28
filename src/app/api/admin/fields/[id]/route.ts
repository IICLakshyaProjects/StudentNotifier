import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Field from "@/models/Field";
import { requireRole } from "@/middleware/auth";

export const runtime = "nodejs";

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function normalizeKey(input: unknown) {
  const raw = String(input ?? "").trim().toLowerCase();
  const cleaned = raw
    .replace(/[^a-z0-9_ -]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const routeParams = await Promise.resolve(context.params);
  const id = routeParams?.id;
  if (!id) return badRequest("id is required");

  const updates: any = {};
  if (body?.label !== undefined) updates.label = String(body.label).trim();
  if (body?.key !== undefined) updates.key = normalizeKey(body.key);
  if (body?.type !== undefined) updates.type = String(body.type).trim();
  if (body?.required !== undefined) updates.required = Boolean(body.required);
  if (body?.enabled !== undefined) updates.enabled = Boolean(body.enabled);
  if (body?.order !== undefined) {
    const o = Number(body.order);
    updates.order = Number.isFinite(o) ? o : 0;
  }

  if (updates.label !== undefined && !updates.label) return badRequest("label is required");
  if (updates.key !== undefined && !updates.key) return badRequest("key is required");

  const allowed = new Set([
    "text",
    "email",
    "tel",
    "url",
    "password",
    "number",
    "date",
    "time",
  ]);
  if (updates.type !== undefined && !allowed.has(updates.type)) {
    return badRequest("invalid type");
  }

  await connectDB();
  try {
    const updated = await Field.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, field: updated });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate key") || e?.code === 11000) {
      return NextResponse.json({ error: "key must be unique" }, { status: 409 });
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
  const deleted = await Field.findByIdAndDelete(id).lean();
  if (!deleted) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

