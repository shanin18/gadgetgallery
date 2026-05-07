import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
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
