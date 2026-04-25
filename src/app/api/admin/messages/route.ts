import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { requireRole } from "@/middleware/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const status = (url.searchParams.get("status") || "").trim();
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") || 20))
  );
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const skip = (page - 1) * limit;

  await connectDB();

  const filter: any = {};
  if (status === "pending" || status === "sent" || status === "failed") {
    filter.status = status;
  }
  if (q) {
    filter.$or = [
      { studentName: { $regex: q, $options: "i" } },
      { parentName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { whatsapp: { $regex: q, $options: "i" } },
      { campus: { $regex: q, $options: "i" } },
    ];
  }

  const [total, msgs] = await Promise.all([
    Message.countDocuments(filter),
    Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(),
  ]);

  return NextResponse.json({
    ok: true,
    page,
    limit,
    total,
    items: msgs.map((m: any) => ({
      id: m._id.toString(),
      studentName: m.studentName,
      parentName: m.parentName,
      email: m.email,
      phone: m.whatsapp,
      campus: m.campus,
      date: m.date,
      time: m.time,
      status: m.status,
      createdAt: m.createdAt,
    })),
  });
}

