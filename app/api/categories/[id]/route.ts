import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/utils";

const categoryUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  image: z.string().trim().url().nullable().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, { name: "admin-category-update", limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = categoryUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category details." }, { status: 400 });
  }

  try {
    const category = await db.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        image: parsed.data.image || null
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
    }

    console.error("Category update failed.", error);
    return NextResponse.json({ error: "Could not update category." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, { name: "admin-category-delete", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.category.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (error) {
    console.error("Category delete failed.", error);
    return NextResponse.json({ error: "Category could not be deleted because it may contain products or child categories." }, { status: 409 });
  }
}
