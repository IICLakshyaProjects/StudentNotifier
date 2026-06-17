import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ResourceCategory from "@/models/ResourceCategory";
import ResourceFile from "@/models/ResourceFile";
import { requireRole } from "@/middleware/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  await connectDB();

  const category = await ResourceCategory.findById(id).lean();
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fileCount = await ResourceFile.countDocuments({ categoryId: id });

  return NextResponse.json({ ok: true, category: { ...category, fileCount } });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  await connectDB();
  const update: Record<string, unknown> = {};
  if (body?.name !== undefined) update.name = String(body.name).trim();
  if (body?.enabled !== undefined) update.enabled = Boolean(body.enabled);
  if (body?.order !== undefined) update.order = Number(body.order);

  const category = await ResourceCategory.findByIdAndUpdate(id, update, {
    new: true,
  }).lean();
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, category });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  await connectDB();

  const fileCount = await ResourceFile.countDocuments({ categoryId: id });
  if (fileCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${fileCount} file(s) exist in this category. Delete files first.`,
      },
      { status: 409 }
    );
  }

  await ResourceCategory.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
