import { NextResponse } from "next/server";
import { listSubfolders } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "";
  const hasValidKey = rawKey.includes("PRIVATE KEY");

  const mode = email && hasValidKey
    ? "service-account"
    : process.env.GOOGLE_API_KEY
    ? "api-key"
    : "no-credentials";

  try {
    const folders = await listSubfolders();
    return NextResponse.json({ mode, folders });
  } catch (err: any) {
    return NextResponse.json({
      mode,
      error: err?.message ?? String(err),
      keyPreview: rawKey.slice(0, 40),
    });
  }
}
