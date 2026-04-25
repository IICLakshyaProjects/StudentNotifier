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
  const name = body?.name?.toString().trim();
  const email = body?.email?.toString().trim().toLowerCase();
  const password = body?.password?.toString();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email, password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "password must be at least 6 characters" },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) {
    return NextResponse.json({ error: "email already in use" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "user",
  });

  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const res = NextResponse.json(
    {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 }
  );
  res.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(accessMaxAgeSeconds()));
  res.cookies.set(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(refreshMaxAgeSeconds())
  );
  return res;
}

