import { NextResponse } from "next/server";
import { cloudinaryConfigured } from "@/lib/cloudinary";

export async function POST() {
  if (!cloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }
  return NextResponse.json({ url: "" });
}
