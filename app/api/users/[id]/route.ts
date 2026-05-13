import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const roleSchema = z.object({
  role: z.enum(["USER", "ADMIN"])
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

async function isLastAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") return false;

  const adminCount = await db.user.count({ where: { role: "ADMIN" } });
  return adminCount <= 1;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const parsed = roleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid role." }, { status: 400 });

  if (id === session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 });
  }

  if (parsed.data.role === "USER" && await isLastAdmin(id)) {
    return NextResponse.json({ error: "At least one admin account is required." }, { status: 400 });
  }

  await db.user.update({
    where: { id },
    data: { role: parsed.data.role }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  if (await isLastAdmin(id)) {
    return NextResponse.json({ error: "At least one admin account is required." }, { status: 400 });
  }

  await db.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
