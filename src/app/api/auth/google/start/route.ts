import { NextResponse } from "next/server";

import { cookieOptions } from "@/lib/auth-cookies";
import {
  googleAuthUrl,
  randomString,
  requiredEnv,
  sha256Base64Url,
} from "@/lib/oauth-google";

export const runtime = "nodejs";

const STATE_COOKIE = "sn_google_state";
const VERIFIER_COOKIE = "sn_google_verifier";

export async function GET(request: Request) {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID");

  const baseUrl = (process.env.APP_URL || "").trim().replace(/\/+$/, "");
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (baseUrl ? `${baseUrl}/api/auth/google/callback` : null);

  if (!redirectUri) {
    return NextResponse.json(
      { error: "Missing APP_URL (or GOOGLE_REDIRECT_URI)" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const returnTo = (url.searchParams.get("returnTo") || "").trim();

  const state = randomString(24);
  const codeVerifier = randomString(48);
  const codeChallenge = sha256Base64Url(codeVerifier);

  const res = NextResponse.redirect(
    googleAuthUrl({
      clientId,
      redirectUri,
      state,
      codeChallenge,
      returnTo: returnTo || undefined,
    })
  );

  // short-lived cookies for the oauth handshake
  res.cookies.set(STATE_COOKIE, state, cookieOptions(10 * 60));
  res.cookies.set(VERIFIER_COOKIE, codeVerifier, cookieOptions(10 * 60));

  return res;
}

