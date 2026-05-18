import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadBase64Image } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const limited = rateLimit(request, { name: "upload", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await request.json();

  if (typeof data !== "string" || !data.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image upload." }, { status: 400 });
  }
  const match = data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const mimeType = match?.[1];
  const payload = match?.[2];

  if (!mimeType || !payload || !SUPPORTED_IMAGE_TYPES.has(mimeType)) {
    return NextResponse.json({ error: "Only JPG, PNG and WebP images are supported." }, { status: 400 });
  }

  const estimatedBytes = Math.floor((payload.length * 3) / 4);
  if (estimatedBytes > MAX_IMAGE_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 413 });
  }

  try {
    const uploaded = await uploadBase64Image(data);
    return NextResponse.json({ url: uploaded.secure_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
