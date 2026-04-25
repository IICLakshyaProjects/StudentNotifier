import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessMaxAgeSeconds,
  cookieOptions,
  refreshMaxAgeSeconds,
} from "@/lib/auth-cookies";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().trim().toLowerCase();
  const password = body?.password?.toString();

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findOne({ email }).select("+password name email role");

  if (!user) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  if (!user.password) {
    // Should never happen, but avoids bcrypt throwing.
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const res = NextResponse.json({
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(accessMaxAgeSeconds()));
  res.cookies.set(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(refreshMaxAgeSeconds())
  );
  return res;
}

