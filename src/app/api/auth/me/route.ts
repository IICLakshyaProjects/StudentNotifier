import { NextResponse } from "next/server";

import { requireAuth } from "@/middleware/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    ok: true,
    user: {
      id: auth.user._id.toString(),
      name: auth.user.name,
      email: auth.user.email,
      role: auth.user.role,
    },
  });
}

