import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import {
  listFilesInFolder,
  getFolderName,
  driveViewUrl,
  driveDownloadUrl,
} from "@/lib/google-drive";

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
    const [folderName, rawFiles] = await Promise.all([
      getFolderName(folderId),
      listFilesInFolder(folderId),
    ]);

    const files = rawFiles.map((f) => ({
      ...f,
      viewUrl: driveViewUrl(f.id),
      downloadUrl: driveDownloadUrl(f.id),
    }));

    return NextResponse.json({ ok: true, folderName, files });
  } catch (err: any) {
    console.error("[resources/files]", err);
    return NextResponse.json(
      { error: "Failed to fetch files from Google Drive" },
      { status: 502 }
    );
  }
}
