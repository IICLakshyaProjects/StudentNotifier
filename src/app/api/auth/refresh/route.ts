import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessMaxAgeSeconds,
  cookieOptions,
  getCookieFromRequest,
} from "@/lib/auth-cookies";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const refreshToken =
    request.headers.get("content-type")?.includes("application/json")
      ? body?.refreshToken?.toString()
      : null;
  const cookieRefresh = getCookieFromRequest(request, REFRESH_COOKIE);
  const token = cookieRefresh || refreshToken;

  if (!token) {
    return NextResponse.json({ error: "refresh token is required" }, { status: 400 });
  }

  let decoded: any;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return NextResponse.json({ error: "invalid refresh token" }, { status: 401 });
  }

  const userId = decoded?.sub?.toString();
  if (!userId) {
    return NextResponse.json({ error: "invalid refresh token" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(userId).select("_id role").lean();
  if (!user) {
    return NextResponse.json({ error: "invalid refresh token" }, { status: 401 });
  }

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(accessMaxAgeSeconds()));
  return res;
}

