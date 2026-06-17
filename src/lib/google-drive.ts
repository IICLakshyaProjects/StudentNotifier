import { google } from "googleapis";

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

function getDrive() {
  // Prefer service account if configured
  if (
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  ) {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    return google.drive({ version: "v3", auth });
  }
  // Fall back to API key (requires folder to be publicly shared)
  return google.drive({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
  });
}

export type DriveFolder = {
  id: string;
  name: string;
  fileCount?: number;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size: string | null;
  createdTime: string | null;
  webViewLink: string | null;
  thumbnailLink: string | null;
};

export async function listSubfolders(): Promise<DriveFolder[]> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "name",
    pageSize: 100,
  });
  return (res.data.files || []).map((f) => ({
    id: f.id!,
    name: f.name!,
  }));
}

export async function listSubfoldersWithCounts(): Promise<DriveFolder[]> {
  const folders = await listSubfolders();
  const counts = await Promise.all(
    folders.map((f) => countFilesInFolder(f.id))
  );
  return folders.map((f, i) => ({ ...f, fileCount: counts[i] }));
}

export async function countFilesInFolder(folderId: string): Promise<number> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    pageSize: 1000,
  });
  return (res.data.files || []).length;
}

export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    fields:
      "files(id, name, mimeType, size, createdTime, webViewLink, thumbnailLink)",
    orderBy: "name",
    pageSize: 1000,
  });
  return (res.data.files || []).map((f) => ({
    id: f.id!,
    name: f.name!,
    mimeType: f.mimeType || "application/octet-stream",
    size: f.size ?? null,
    createdTime: f.createdTime ?? null,
    webViewLink: f.webViewLink ?? null,
    thumbnailLink: f.thumbnailLink ?? null,
  }));
}

export async function getFolderName(folderId: string): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.get({
    fileId: folderId,
    fields: "name",
  });
  return res.data.name || folderId;
}

export function driveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function driveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}
