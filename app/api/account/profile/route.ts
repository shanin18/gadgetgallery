import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, address] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    db.address.findFirst({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    })
  ]);

  return NextResponse.json({ user, address });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, avatarUrl, address } = await request.json();

  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: session.user.id },
      data: { name, phone, image: avatarUrl }
    });

    let savedAddress = null;
    if (address) {
      const existingAddress = await tx.address.findFirst({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
      });
      const data = {
        street: address.street ?? "",
        city: address.city ?? "",
        state: address.state || null,
        postalCode: address.postalCode || null,
        country: address.country || "Bangladesh",
        isDefault: true
      };

      savedAddress = existingAddress
        ? await tx.address.update({ where: { id: existingAddress.id }, data })
        : await tx.address.create({
            data: {
              ...data,
              userId: session.user.id
            }
          });
    }

    return { user, address: savedAddress };
  });

  return NextResponse.json(result);
}
