import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireRole } from "@/middleware/auth";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  const name = body?.name?.toString().trim();
  const email = body?.email?.toString().trim().toLowerCase();
  const role = body?.role?.toString().trim();
  const password = body?.password?.toString();

  if (!name || !email || (role !== "admin" && role !== "user")) {
    return NextResponse.json(
      { error: "name, email, role are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const existingEmail = await User.findOne({ email, _id: { $ne: id } })
    .select("_id")
    .lean();
  if (existingEmail) {
    return NextResponse.json({ error: "email already in use" }, { status: 409 });
  }

  const update: any = { name, email, role };
  if (password && password.trim().length > 0) {
    if (password.length < 6) {
      return NextResponse.json(
        { error: "password must be at least 6 characters" },
        { status: 400 }
      );
    }
    update.password = await bcrypt.hash(password, 10);
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true })
    .select("_id name email role createdAt")
    .lean();

  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  await connectDB();

  const res = await User.findByIdAndDelete(id).select("_id").lean();
  if (!res) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

