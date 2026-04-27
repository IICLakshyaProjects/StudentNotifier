import { NextResponse } from "next/server";
import { Readable } from "node:stream";

import * as xlsx from "xlsx";
import csvParser from "csv-parser";

import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { requireAuth } from "@/middleware/auth";
import { buildCounsellingEmailHtml, buildCounsellingMessage } from "@/lib/message";
import { sendWhatsApp } from "@/lib/infinito";
import { sendEmail } from "@/lib/mailer";
import { isInfinitoSynqEnabled } from "@/lib/feature-flags";
import path from "node:path";
import {
  isEmail,
  normalizeEmail,
  normalizePhone,
  normalizeString,
} from "@/lib/validate";

export const runtime = "nodejs";

const REQUIRED_COLUMNS = [
  "email",
  "Student Name",
  "Parent Name",
  "WhatsApp No",
  "Campus",
  "Date",
  "Time",
  "Location Link",
];

function toBuffer(file: File): Promise<Buffer> {
  return file.arrayBuffer().then((ab) => Buffer.from(ab));
}

function normalizeHeader(h: unknown): string {
  return String(h ?? "").trim();
}

type RowRecord = Record<string, unknown>;

function parseCsv(buffer: Buffer): Promise<RowRecord[]> {
  return new Promise<RowRecord[]>((resolve, reject) => {
    const rows: RowRecord[] = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => normalizeHeader(header),
          skipLines: 0,
          strict: false,
        })
      )
      .on("data", (data) => rows.push(data))
      .on("error", reject)
      .on("end", () => resolve(rows));
  });
}

function parseExcel(buffer: Buffer): RowRecord[] {
  const wb = xlsx.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json<RowRecord>(ws, { defval: "" });
  // sheet_to_json returns keys exactly as headers in row 1
  return json.map((row) => {
    const out: RowRecord = {};
    for (const [k, v] of Object.entries(row)) {
      out[normalizeHeader(k)] = v;
    }
    return out;
  });
}

function validateColumns(rows: RowRecord[]) {
  const headers = new Set<string>();
  for (const row of rows.slice(0, 5)) {
    Object.keys(row || {}).forEach((k) => headers.add(k));
  }
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.has(c));
  return { headers: [...headers], missing };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendOne({
  record,
  authUserId,
}: {
  record: {
    studentName: string;
    parentName?: string;
    email: string;
    whatsapp: string;
    campus: string;
    date: string;
    time: string;
    address?: string;
    location: string;
  };
  authUserId: any;
}) {
  const studentName = normalizeString(record.studentName);
  const parentName = normalizeString(record.parentName);
  const email = normalizeEmail(record.email);
  const whatsapp = normalizePhone(record.whatsapp);
  const campus = normalizeString(record.campus);
  const date = normalizeString(record.date);
  const time = normalizeString(record.time);
  const address = normalizeString(record.address);
  const location = normalizeString(record.location);

  const text = buildCounsellingMessage({
    studentName,
    campus,
    date,
    time,
    location,
  });
  const html = buildCounsellingEmailHtml({
    baseUrl: process.env.APP_URL,
    studentName,
    campus,
    date,
    time,
    address,
    location,
  });

  const msg = await Message.create({
    studentName,
    parentName,
    email,
    whatsapp,
    campus,
    date,
    time,
    address,
    location,
    status: "pending",
    createdBy: authUserId,
  });

  let status: "sent" | "failed" = "sent";
  const errors: string[] = [];

  if (isInfinitoSynqEnabled()) {
    try {
      await sendWhatsApp({ to: whatsapp, message: text });
    } catch (e: any) {
      status = "failed";
      errors.push(`whatsapp: ${e?.message || "failed"}`);
    }
  }

  try {
    await sendEmail({
      to: email,
      subject: "Counselling session confirmed",
      text,
      html,
      attachments: [
        {
          filename: "WHITE.png",
          path: path.join(process.cwd(), "public", "WHITE.png"),
          cid: "lakshya-logo",
        },
      ],
    });
  } catch (e: any) {
    status = "failed";
    errors.push(`email: ${e?.message || "failed"}`);
  }

  msg.status = status;
  await msg.save();

  return { id: msg._id.toString(), status, errors };
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "multipart/form-data is required" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required (field name: file)" }, { status: 400 });
  }

  const dryRun = String(form.get("dryRun") ?? "").toLowerCase() === "true";
  const buffer = await toBuffer(file);

  const name = (file as any).name?.toString?.() || "upload";
  const lower = name.toLowerCase();

  let rows: RowRecord[] = [];
  if (lower.endsWith(".csv")) {
    rows = await parseCsv(buffer);
  } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    rows = parseExcel(buffer);
  } else {
    return NextResponse.json(
      { error: "unsupported file type (use .csv, .xlsx, .xls)" },
      { status: 400 }
    );
  }

  if (!rows.length) {
    return NextResponse.json({ error: "file contained no rows" }, { status: 400 });
  }

  const { missing } = validateColumns(rows);
  if (missing.length) {
    return NextResponse.json(
      { error: "missing required columns", missing, required: REQUIRED_COLUMNS },
      { status: 400 }
    );
  }

  // Convert to internal shape + validate each row
  const records: Array<{
    studentName: string;
    parentName?: string;
    email: string;
    whatsapp: string;
    campus: string;
    date: string;
    time: string;
    location: string;
  }> = [];
  const rowErrors: Array<{ row: number; errors: string[] }> = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header row is 1
    const studentName = normalizeString(row["Student Name"]);
    const parentName = normalizeString(row["Parent Name"]);
    const email = normalizeEmail(row["email"]);
    const whatsapp = normalizePhone(row["WhatsApp No"]);
    const campus = normalizeString(row["Campus"]);
    const date = normalizeString(row["Date"]);
    const time = normalizeString(row["Time"]);
    const location = normalizeString(row["Location Link"]);

    const errs: string[] = [];
    if (!studentName) errs.push("Student Name is required");
    if (!email || !isEmail(email)) errs.push("valid email is required");
    if (!whatsapp) errs.push("WhatsApp No is required");
    if (!campus) errs.push("Campus is required");
    if (!date) errs.push("Date is required");
    if (!time) errs.push("Time is required");
    if (!location) errs.push("Location Link is required");

    if (errs.length) {
      rowErrors.push({ row: rowNum, errors: errs });
      return;
    }

    records.push({
      studentName,
      parentName,
      email,
      whatsapp,
      campus,
      date,
      time,
      location,
    });
  });

  const maxRecordsEnv = Number(process.env.BULK_MAX_RECORDS || 0);
  const maxRecords =
    Number.isFinite(maxRecordsEnv) && maxRecordsEnv > 0 ? maxRecordsEnv : null;

  if (maxRecords && records.length > maxRecords) {
    return NextResponse.json(
      {
        error: `too many records (max ${maxRecords})`,
        maxRecords,
        validRecords: records.length,
        invalidRows: rowErrors.length,
        rowErrors,
      },
      { status: 400 }
    );
  }

  if (!records.length) {
    return NextResponse.json(
      { error: "no valid rows found", rowErrors },
      { status: 400 }
    );
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      totalRows: rows.length,
      validRecords: records.length,
      invalidRows: rowErrors.length,
      rowErrors,
    });
  }

  await connectDB();

  const batchSize = Number(process.env.BULK_BATCH_SIZE || 50);
  const delayMs = Number(process.env.BULK_DELAY_MS || 250);

  const results: Array<{ id: string; status: string; errors: string[] }> = [];

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    for (const record of batch) {
      const res = await sendOne({ record, authUserId: auth.user._id });
      results.push(res);
      if (delayMs > 0) await sleep(delayMs);
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({
    ok: failed === 0,
    summary: {
      totalRows: rows.length,
      validRecords: records.length,
      invalidRows: rowErrors.length,
      sent,
      failed,
    },
    rowErrors,
    results,
  });
}

