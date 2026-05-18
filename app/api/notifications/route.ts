import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const markAll = body.all === true;
  const notificationId = typeof body.notificationId === "string" ? body.notificationId : null;

  if (markAll) {
    await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });

    return NextResponse.json({ ok: true });
  }

  if (!notificationId) {
    return NextResponse.json({ error: "Notification id is required." }, { status: 400 });
  }

  await db.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true }
  });

  return NextResponse.json({ ok: true });
}
