import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { getDriveFileThumbnail } from "@/lib/google-drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const file = await getDriveFileThumbnail(id);
    const safeName = file.name.replace(/[^\w.\-]/g, "_");

    return new NextResponse(file.buffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${safeName}.png"`,
        "Content-Length": String(file.buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: unknown) {
    console.error("[resources/drive-files/thumbnail]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch preview image";
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}