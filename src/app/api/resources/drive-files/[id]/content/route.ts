import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { getDriveFileContent } from "@/lib/google-drive";

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
    const file = await getDriveFileContent(id);
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const safeName = file.name.replace(/[^\w.\-]/g, "_");

    return new NextResponse(file.buffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `${disposition}; filename="${safeName}"`,
        "Content-Length": String(file.buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: unknown) {
    console.error("[resources/drive-files/content]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch file";
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}