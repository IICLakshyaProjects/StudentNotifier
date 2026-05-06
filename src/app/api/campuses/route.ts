import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Campus from "@/models/Campus";
import { normalizeCampusSequence } from "@/lib/campus-sequence";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();
  const campuses = await Campus.find({ enabled: true })
    .select("_id name slug address location order enabled nextSequence")
    .sort({ order: 1, createdAt: 1 })
    .lean();

  return NextResponse.json({
    ok: true,
    campuses: campuses.map((campus) => ({
      ...campus,
      nextSequence: normalizeCampusSequence(campus.nextSequence),
    })),
  });
}
