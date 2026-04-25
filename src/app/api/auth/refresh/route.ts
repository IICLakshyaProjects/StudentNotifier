import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const refreshToken = body?.refreshToken?.toString();

  if (!refreshToken) {
    return NextResponse.json({ error: "refreshToken is required" }, { status: 400 });
  }

  let decoded: any;
  try {
    decoded = verifyRefreshToken(refreshToken);
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
  return NextResponse.json({ accessToken });
}

