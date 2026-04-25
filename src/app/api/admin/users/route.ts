import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireRole } from "@/middleware/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const role = (url.searchParams.get("role") || "").trim();
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") || 20))
  );
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const skip = (page - 1) * limit;

  await connectDB();

  const filter: any = {};
  if (role === "admin" || role === "user") filter.role = role;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
    .select("_id name email role createdAt")
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
    items: users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
  });
}

