import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ResourceFile from "@/models/ResourceFile";
import { requireAuth } from "@/middleware/auth";
import { getResourceFromS3 } from "@/lib/s3-resources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  await connectDB();

  const file = (await ResourceFile.findById(id).lean()) as any;
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const s3Res = await getResourceFromS3(file.s3Key);
    if (!s3Res.Body) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const safeName = file.originalName.replace(/[^\w.\-]/g, "_");

    const buffer = Buffer.from(await s3Res.Body.transformToByteArray());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${safeName}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Error fetching resource from S3:", e);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
