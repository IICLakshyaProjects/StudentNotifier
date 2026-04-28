import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Field from "@/models/Field";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();
  const fields = await Field.find({ enabled: true })
    .select("_id label key type required order enabled")
    .sort({ order: 1, createdAt: 1 })
    .lean();

  return NextResponse.json({ ok: true, fields });
}

