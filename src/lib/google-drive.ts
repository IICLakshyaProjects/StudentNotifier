import { google } from "googleapis";

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

function getDrive() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (email && rawKey && rawKey.includes("PRIVATE KEY")) {
    const key = rawKey.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    return google.drive({ version: "v3", auth });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) {
    return google.drive({ version: "v3", auth: apiKey });
  }

  throw new Error(
    "No Google credentials configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or GOOGLE_API_KEY in .env"
  );
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
  viewUrl: string;
  downloadUrl: string;
};

export async function listSubfolders(): Promise<DriveFolder[]> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name)",
    orderBy: "name",
    pageSize: 100,
  });
  return (res.data.files || []).map((f) => ({ id: f.id!, name: f.name! }));
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

export async function listSubfoldersWithCounts(): Promise<DriveFolder[]> {
  const folders = await listSubfolders();
  const counts = await Promise.all(folders.map((f) => countFilesInFolder(f.id)));
  return folders.map((f, i) => ({ ...f, fileCount: counts[i] }));
}

export async function listSubfoldersInFolder(folderId: string): Promise<DriveFolder[]> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name)",
    orderBy: "name",
    pageSize: 100,
  });
  return (res.data.files || []).map((f) => ({ id: f.id!, name: f.name! }));
}

export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name,mimeType,size,createdTime,webViewLink,thumbnailLink)",
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
    viewUrl: `https://drive.google.com/file/d/${f.id}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${f.id}`,
  }));
}

export async function getFolderName(folderId: string): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.get({ fileId: folderId, fields: "name" });
  return res.data.name || folderId;
}
