import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ResourceFile from "@/models/ResourceFile";
import { requireRole } from "@/middleware/auth";
import { deleteResourceFromS3 } from "@/lib/s3-resources";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  await connectDB();

  const file = (await ResourceFile.findById(id).lean()) as any;
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteResourceFromS3(file.s3Key);
  await ResourceFile.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
