import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ResourceCategory from "@/models/ResourceCategory";
import ResourceFile from "@/models/ResourceFile";
import { requireRole } from "@/middleware/auth";

export const runtime = "nodejs";

function slugify(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  await connectDB();
  const categories = await ResourceCategory.find({})
    .sort({ order: 1, name: 1 })
    .lean();

  const counts = await ResourceFile.aggregate([
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = Object.fromEntries(
    counts.map((c: any) => [String(c._id), c.count])
  );

  const result = categories.map((cat: any) => ({
    ...cat,
    fileCount: countMap[String(cat._id)] ?? 0,
  }));

  return NextResponse.json({ ok: true, categories: result });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const enabled = body?.enabled === undefined ? true : Boolean(body.enabled);
  const order = Number(body?.order ?? 0);
  const slug = slugify(String(body?.slug || name));

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "slug could not be derived from name" }, { status: 400 });

  await connectDB();
  try {
    const created = await ResourceCategory.create({ name, slug, enabled, order });
    return NextResponse.json({ ok: true, category: created });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: "A category with this name/slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
