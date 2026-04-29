import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Campus from "@/models/Campus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toLocationHref(location: string) {
  const value = String(location || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const routeParams = await Promise.resolve(context.params);
  const slug = String(routeParams?.slug || "").trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  await connectDB();
  const campus = await Campus.findOne({ slug }).select("location enabled").lean();
  if (!campus || campus.enabled === false) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const target = toLocationHref(String((campus as any).location || ""));
  if (!target) {
    return NextResponse.json({ error: "location not configured" }, { status: 404 });
  }

  return NextResponse.redirect(target, 302);
}
