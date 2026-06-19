import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import path from "node:path";
import connectDB from "@/lib/db";
import ResourceCategory from "@/models/ResourceCategory";
import ResourceFile from "@/models/ResourceFile";
import { requireRole } from "@/middleware/auth";
import { uploadResourceToS3 } from "@/lib/s3-resources";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  await connectDB();
  const query = categoryId ? { categoryId } : {};
  const files = await ResourceFile.find(query)
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, files });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  await connectDB();
  const category = (await ResourceCategory.findById(categoryId).lean()) as any;
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const ext = path.extname(file.name);
  const s3Key = `resources/${category.slug}/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  await uploadResourceToS3(s3Key, buffer, mimeType);

  const created = await ResourceFile.create({
    categoryId,
    name,
    originalName: file.name,
    s3Key,
    mimeType,
    size: buffer.length,
    uploadedBy: (auth as any).user._id,
  });

  return NextResponse.json({ ok: true, file: created });
}
