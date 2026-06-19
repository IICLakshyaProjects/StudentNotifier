import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { listSubfoldersWithCounts } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const categories = await listSubfoldersWithCounts();
    return NextResponse.json({ ok: true, categories });
  } catch (err: any) {
    console.error("[resources/categories]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch resource categories from Google Drive" },
      { status: 502 }
    );
  }
}
