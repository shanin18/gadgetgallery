export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadImageStub() {
  if (!cloudinaryConfigured()) {
    throw new Error("Cloudinary environment variables are not configured.");
  }
  return { secure_url: "" };
}
