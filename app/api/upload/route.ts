import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadBase64Image } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await request.json();

  if (typeof data !== "string" || !data.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image upload." }, { status: 400 });
  }

  try {
    const uploaded = await uploadBase64Image(data);
    return NextResponse.json({ url: uploaded.secure_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
