import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Campus from "@/models/Campus";
import { requireAuth } from "@/middleware/auth";
import { sendWhatsApp } from "@/lib/infinito";
import { sendEmail } from "@/lib/mailer";
import { buildCounsellingEmailHtml, buildCounsellingMessage } from "@/lib/message";
import { isInfinitoSynqEnabled } from "@/lib/feature-flags";
import path from "node:path";
import {
  isEmail,
  normalizeEmail,
  normalizePhone,
  normalizeString,
} from "@/lib/validate";

export const runtime = "nodejs";

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);

  const studentName = normalizeString(body?.studentName);
  const email = normalizeEmail(body?.email);
  const whatsapp = normalizePhone(body?.whatsapp);
  const contactNumber = normalizePhone(body?.contactNumber) || whatsapp;
  const campus = normalizeString(body?.campus);
  const date = normalizeString(body?.date);
  const time = normalizeString(body?.time);
  const address = normalizeString(body?.address);
  const location = normalizeString(body?.location);
  // sessionId is generated server-side (per-campus sequential)
  const extraFields =
    body?.extraFields && typeof body.extraFields === "object"
      ? body.extraFields
      : {};

  if (!studentName) return badRequest("studentName is required");
  if (!email || !isEmail(email)) return badRequest("valid email is required");
  if (!whatsapp) return badRequest("whatsapp is required");
  if (!campus) return badRequest("campus is required");
  if (!date) return badRequest("date is required");
  if (!time) return badRequest("time is required");
  if (!address) return badRequest("address is required");
  if (!location) return badRequest("location is required");

  const text = buildCounsellingMessage({
    studentName,
    campus,
    date,
    time,
    location,
  });
  await connectDB();

  // Generate a persistent, per-campus sequential ID (5 digits), atomically
  const campusSlug =
    campus.replace(/[^a-z0-9]+/gi, "").toUpperCase().slice(0, 10) || "CAMPUS";
  const updated = await Campus.findOneAndUpdate(
    { slug: campusSlug.toLowerCase() },
    {
      $setOnInsert: {
        name: campus,
        slug: campusSlug.toLowerCase(),
        enabled: true,
        order: 0,
      },
      $inc: { nextSequence: 1 },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      returnDocument: "after",
    }
  ).lean();
  const nextAfterInc = Number((updated as any)?.nextSequence || 2);
  const seq = Math.max(1, nextAfterInc - 1);
  const sessionId = `LAK${campusSlug}${String(seq).padStart(5, "0")}`;

  const html = buildCounsellingEmailHtml({
    baseUrl: process.env.APP_URL,
    studentName,
    campus,
    date,
    time,
    address,
    location,
    contactNumber,
    extraFields,
    sessionId,
  });

  const msg = await Message.create({
    studentName,
    email,
    whatsapp,
    campus,
    date,
    time,
    address,
    location,
    sessionId,
    extraFields,
    status: "pending",
    createdBy: auth.user._id,
  });

  let whatsappResult: any = null;
  let emailResult: any = null;
  let status: "sent" | "failed" = "sent";
  const errors: string[] = [];

  if (isInfinitoSynqEnabled()) {
    try {
      whatsappResult = await sendWhatsApp({ to: whatsapp, message: text });
    } catch (e: any) {
      status = "failed";
      errors.push(`whatsapp: ${e?.message || "failed"}`);
    }
  } else {
    whatsappResult = { skipped: true };
  }

  try {
    emailResult = await sendEmail({
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

  return NextResponse.json({
    ok: status === "sent",
    message: {
      id: msg._id.toString(),
      status: msg.status,
      sessionId: msg.sessionId,
    },
    results: { whatsapp: whatsappResult, email: emailResult },
    errors,
  });
}

