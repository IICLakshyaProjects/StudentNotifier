import { parseDurationToSeconds } from "@/lib/duration";

export const ACCESS_COOKIE = "sn_access";
export const REFRESH_COOKIE = "sn_refresh";

export function cookieOptions(maxAgeSeconds: number): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
} {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function accessMaxAgeSeconds() {
  return parseDurationToSeconds(process.env.JWT_EXPIRATION || "1h", 60 * 60);
}

export function refreshMaxAgeSeconds() {
  return parseDurationToSeconds(
    process.env.JWT_REFRESH_EXPIRATION || "7d",
    60 * 60 * 24 * 7
  );
}

export function getCookieFromRequest(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  const parts = raw.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (!p) continue;
    const eq = p.indexOf("=");
    if (eq === -1) continue;
    const k = p.slice(0, eq).trim();
    if (k === name) return decodeURIComponent(p.slice(eq + 1));
  }
  return null;
}

