import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request, context: { params: Promise<{ key?: string[] }> | { key?: string[] } }) {
  try {
    const { searchParams } = new URL(request.url);
    const routeParams = await Promise.resolve(context.params);
    const keyFromRoute = routeParams.key ? routeParams.key.join("/") : "";
    const key = searchParams.get("key") || keyFromRoute;

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.ContentType || "image/png",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
