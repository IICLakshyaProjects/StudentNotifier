import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/jwt";

function getBearerToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [type, token] = authHeader.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function getAuthUser(request) {
  const token = getBearerToken(request);
  if (!token) return null;

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return null;
  }

  const userId = decoded?.sub;
  if (!userId) return null;

  await connectDB();
  const user = await User.findById(userId).select("_id name email role").lean();
  return user || null;
}

export async function requireAuth(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, user };
}

export async function requireRole(request, roles) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;

  if (!roles.includes(auth.user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}

