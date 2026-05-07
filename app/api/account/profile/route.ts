import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "next-auth/react";

export async function PUT(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, avatarUrl } =
    await request.json();

  await db.user.update({
    where: { id: session.user.id },
    data: { name, phone, image: avatarUrl }
  });

  return NextResponse.json({ user: await db.user.findUnique({ where: { id: session.user.id } }) });
}