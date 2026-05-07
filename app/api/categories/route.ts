import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
  try {
    const category = await db.category.create({
      data: {
        name: parsed.data.name,
        slug,
        image: parsed.data.image
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
    }

    console.error("Category create failed.", error);
    return NextResponse.json({ error: "Could not create category." }, { status: 500 });
  }
}
