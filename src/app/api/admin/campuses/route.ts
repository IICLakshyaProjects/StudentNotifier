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

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  await connectDB();
  const campuses = await Campus.find({})
    .select("_id name slug address location enabled order nextSequence createdAt")
    .sort({ order: 1, createdAt: 1 })
    .lean();

  return NextResponse.json({ ok: true, campuses });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const address = String(body?.address ?? "").trim();
  const location = String(body?.location ?? "").trim();
  const enabled = body?.enabled === undefined ? true : Boolean(body?.enabled);
  const order = Number(body?.order ?? 0);
  const slug = normalizeSlug(body?.slug || name);

  if (!name) return badRequest("name is required");
  if (!slug) return badRequest("slug is required");

  await connectDB();
  try {
    const created = await Campus.create({
      name,
      slug,
      address,
      location,
      enabled,
      order: Number.isFinite(order) ? order : 0,
      nextSequence: 1,
    });
    return NextResponse.json({ ok: true, campus: created });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate key") || e?.code === 11000) {
      return NextResponse.json({ error: "slug must be unique" }, { status: 409 });
    }
    throw e;
  }
}
