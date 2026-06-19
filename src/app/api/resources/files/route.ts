import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { listFilesInFolder, listSubfoldersInFolder, getFolderName } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) {
    return NextResponse.json(
      { error: "folderId is required" },
      { status: 400 }
    );
  }

  try {
    const [folderName, files, subfolders] = await Promise.all([
      getFolderName(folderId),
      listFilesInFolder(folderId),
      listSubfoldersInFolder(folderId),
    ]);

    return NextResponse.json({ ok: true, folderName, files, subfolders });
  } catch (err: any) {
    console.error("[resources/files]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch files from Google Drive" },
      { status: 502 }
    );
  }
}
