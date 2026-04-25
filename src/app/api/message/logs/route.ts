import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { requireAuth } from "@/middleware/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 50)));

  await connectDB();
  const items = await Message.find({ createdBy: auth.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({
    ok: true,
    items: items.map((m: any) => ({
      id: m._id.toString(),
      studentName: m.studentName,
      parentName: m.parentName,
      email: m.email,
      whatsapp: m.whatsapp,
      campus: m.campus,
      date: m.date,
      time: m.time,
      location: m.location,
      status: m.status,
      createdAt: m.createdAt,
    })),
  });
}

