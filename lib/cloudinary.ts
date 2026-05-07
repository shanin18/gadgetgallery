import { createHash } from "crypto";

export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadBase64Image(data: string) {
  if (!cloudinaryConfigured()) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = "gadgetgallery/profiles";
  const timestamp = Math.round(Date.now() / 1000).toString();
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  const formData = new FormData();

  formData.append("file", data);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error?.message ?? "Cloudinary upload failed.");
  }

  return result as { secure_url: string };
}
