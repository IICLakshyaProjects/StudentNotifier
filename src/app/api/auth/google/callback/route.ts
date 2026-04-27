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
import {
  exchangeCodeForTokens,
  getGoogleIdTokenInfo,
  requiredEnv,
} from "@/lib/oauth-google";

export const runtime = "nodejs";

const STATE_COOKIE = "sn_google_state";
const VERIFIER_COOKIE = "sn_google_verifier";

function safeReturnTo(raw: string | null) {
  const v = (raw || "").trim();
  if (!v) return null;
  // only allow relative paths
  if (!v.startsWith("/")) return null;
  if (v.startsWith("//")) return null;
  return v;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));

  if (!code || !state) {
    return NextResponse.redirect("/login");
  }

  // Use NextResponse cookies API to read? Not available on Request; parse manually:
  const rawCookie = request.headers.get("cookie") || "";
  const cookieMap = new Map(
    rawCookie.split(";").map((p) => {
      const idx = p.indexOf("=");
      if (idx === -1) return [p.trim(), ""];
      return [p.slice(0, idx).trim(), decodeURIComponent(p.slice(idx + 1).trim())];
    })
  );

  const expectedState = cookieMap.get(STATE_COOKIE);
  const codeVerifier = cookieMap.get(VERIFIER_COOKIE);

  if (!expectedState || expectedState !== state || !codeVerifier) {
    return NextResponse.redirect("/login");
  }

  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET");

  const baseUrl = (process.env.APP_URL || "").trim().replace(/\/+$/, "");
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (baseUrl ? `${baseUrl}/api/auth/google/callback` : null);
  if (!redirectUri) return NextResponse.redirect("/login");

  let idToken: string;
  try {
    const tokens = await exchangeCodeForTokens({
      code,
      clientId,
      clientSecret,
      redirectUri,
      codeVerifier,
    });
    idToken = tokens.id_token;
  } catch {
    return NextResponse.redirect("/login");
  }

  let info: Awaited<ReturnType<typeof getGoogleIdTokenInfo>>;
  try {
    info = await getGoogleIdTokenInfo(idToken);
  } catch {
    return NextResponse.redirect("/login");
  }

  if (info.aud !== clientId) {
    return NextResponse.redirect("/login");
  }

  const email = info.email?.toString().trim().toLowerCase();
  const emailVerified = info.email_verified === "true";
  const name = info.name?.toString().trim() || "User";

  if (!email || !emailVerified) {
    return NextResponse.redirect("/login");
  }

  await connectDB();
  let user = await User.findOne({ email }).select("_id name email role").lean();

  if (!user) {
    const randomPassword = `google-${Date.now()}-${Math.random()}`;
    const hashed = await bcrypt.hash(randomPassword, 10);
    const created = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
    });
    user = {
      _id: created._id,
      name: created.name,
      email: created.email,
      role: created.role,
    } as any;
  }

  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const destinationPath =
    returnTo || (user.role === "admin" ? "/admin/dashboard" : "/dashboard");

  if (!baseUrl) return NextResponse.redirect("/login");
  const destinationUrl = new URL(destinationPath, baseUrl).toString();

  const res = NextResponse.redirect(destinationUrl);

  // clear handshake cookies
  res.cookies.set(STATE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(VERIFIER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });

  // set session cookies
  res.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(accessMaxAgeSeconds()));
  res.cookies.set(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(refreshMaxAgeSeconds())
  );

  return res;
}

