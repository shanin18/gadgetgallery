import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  image: z.string().trim().url().optional()
});

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category details." }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const category = await db.category.create({
    data: {
      name: parsed.data.name,
      slug,
      image: parsed.data.image
    }
  });

  return NextResponse.json({ category }, { status: 201 });
}
