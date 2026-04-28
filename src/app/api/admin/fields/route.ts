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

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  await connectDB();
  const fields = await Field.find({})
    .select("_id label key type required order enabled createdAt")
    .sort({ order: 1, createdAt: 1 })
    .lean();

  return NextResponse.json({ ok: true, fields });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const label = String(body?.label ?? "").trim();
  const key = normalizeKey(body?.key || label);
  const type = String(body?.type ?? "text").trim();
  const required = Boolean(body?.required);
  const enabled = body?.enabled === undefined ? true : Boolean(body?.enabled);
  const order = Number(body?.order ?? 0);

  if (!label) return badRequest("label is required");
  if (!key) return badRequest("key is required");

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
  if (!allowed.has(type)) return badRequest("invalid type");

  await connectDB();
  try {
    const created = await Field.create({
      label,
      key,
      type,
      required,
      enabled,
      order: Number.isFinite(order) ? order : 0,
    });
    return NextResponse.json({ ok: true, field: created });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate key") || e?.code === 11000) {
      return NextResponse.json({ error: "key must be unique" }, { status: 409 });
    }
    throw e;
  }
}

