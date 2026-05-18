import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification, orderConfirmationMessage, orderDeliveryMessage } from "@/lib/notifications";

const confirmationStatuses = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
const deliveryStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

type ConfirmationStatus = (typeof confirmationStatuses)[number];
type DeliveryStatus = (typeof deliveryStatuses)[number];

type OrderWorkflowRow = {
  id: string;
  userId: string | null;
  orderNumber: string;
  confirmationStatus: ConfirmationStatus;
  confirmedAt: Date | null;
  stockCommitted: boolean;
  status: DeliveryStatus;
  couponCode: string | null;
};

type OrderItemRow = {
  productId: string;
  quantity: number;
};

type ProductStockRow = {
  id: string;
  name: string;
  stock: number;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const confirmationStatus = typeof body.confirmationStatus === "string" ? body.confirmationStatus : undefined;
  const deliveryStatus = typeof body.deliveryStatus === "string" ? body.deliveryStatus : undefined;

  if (confirmationStatus && !confirmationStatuses.includes(confirmationStatus as ConfirmationStatus)) {
    return NextResponse.json({ error: "Invalid confirmation status." }, { status: 400 });
  }

  if (deliveryStatus && !deliveryStatuses.includes(deliveryStatus as DeliveryStatus)) {
    return NextResponse.json({ error: "Invalid delivery status." }, { status: 400 });
  }

  try {
    const [currentOrder] = await db.$queryRaw<OrderWorkflowRow[]>`
      SELECT "id", "userId", "orderNumber", "confirmationStatus", "confirmedAt", "stockCommitted", "status", "couponCode"
      FROM "Order"
      WHERE "id" = ${id}
      LIMIT 1
    `;

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const nextConfirmationStatus = confirmationStatus as ConfirmationStatus | undefined;
    const shouldCommitStock = nextConfirmationStatus === "CONFIRMED" && !currentOrder.stockCommitted;
    const shouldRestoreStock = nextConfirmationStatus === "CANCELLED" && currentOrder.stockCommitted && currentOrder.status !== "DELIVERED";

    if (nextConfirmationStatus === "CANCELLED" && currentOrder.status === "DELIVERED") {
      return NextResponse.json({ error: "Delivered orders cannot be cancelled. Use a return or refund workflow instead." }, { status: 400 });
    }

    if (shouldCommitStock) {
      const items = await db.$queryRaw<OrderItemRow[]>`
        SELECT "productId", "quantity"
        FROM "OrderItem"
        WHERE "orderId" = ${id}
      `;
      const productIds = items.map((item) => item.productId);
      const products = await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, stock: true }
      }) as ProductStockRow[];
      const productById = new Map<string, ProductStockRow>(products.map((product) => [product.id, product]));
      const outOfStockItem = items.find((item) => {
        const product = productById.get(item.productId);
        return product ? product.stock < item.quantity : true;
      });

      if (outOfStockItem) {
        const product = productById.get(outOfStockItem.productId);
        return NextResponse.json({ error: `${product?.name ?? "Product"} does not have enough stock to confirm this order.` }, { status: 400 });
      }

      for (const item of items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    if (shouldRestoreStock) {
      const items = await db.$queryRaw<OrderItemRow[]>`
        SELECT "productId", "quantity"
        FROM "OrderItem"
        WHERE "orderId" = ${id}
      `;

      for (const item of items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }

    if (nextConfirmationStatus) {
      await db.$executeRaw`
        UPDATE "Order"
        SET
          "confirmationStatus" = ${nextConfirmationStatus}::"OrderConfirmationStatus",
          "confirmedAt" = CASE
            WHEN ${nextConfirmationStatus} = 'CONFIRMED' AND "confirmedAt" IS NULL THEN NOW()
            ELSE "confirmedAt"
          END,
          "stockCommitted" = CASE
            WHEN ${shouldCommitStock} THEN true
            WHEN ${shouldRestoreStock} THEN false
            ELSE "stockCommitted"
          END,
          "updatedAt" = NOW()
        WHERE "id" = ${id}
      `;

      if (nextConfirmationStatus !== currentOrder.confirmationStatus) {
        await createNotification({
          userId: currentOrder.userId,
          type: `ORDER_CONFIRMATION_${nextConfirmationStatus}`,
          message: orderConfirmationMessage(currentOrder.orderNumber, nextConfirmationStatus)
        });
      }
    }

    if (deliveryStatus) {
      await db.$executeRaw`
        UPDATE "Order"
        SET "status" = ${deliveryStatus as DeliveryStatus}::"OrderStatus", "updatedAt" = NOW()
        WHERE "id" = ${id}
      `;

      if (deliveryStatus !== currentOrder.status) {
        await createNotification({
          userId: currentOrder.userId,
          type: `ORDER_STATUS_${deliveryStatus}`,
          message: orderDeliveryMessage(currentOrder.orderNumber, deliveryStatus)
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update order.";
    console.error("Order update failed.", error);
    return NextResponse.json({ error: process.env.NODE_ENV === "development" ? message : "Could not update order." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [currentOrder] = await db.$queryRaw<OrderWorkflowRow[]>`
      SELECT "id", "userId", "orderNumber", "confirmationStatus", "confirmedAt", "stockCommitted", "status", "couponCode"
      FROM "Order"
      WHERE "id" = ${id}
      LIMIT 1
    `;

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (currentOrder.stockCommitted && currentOrder.status !== "DELIVERED") {
      const items = await db.$queryRaw<OrderItemRow[]>`
        SELECT "productId", "quantity"
        FROM "OrderItem"
        WHERE "orderId" = ${id}
      `;

      for (const item of items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }

    if (currentOrder.couponCode) {
      await db.coupon.updateMany({
        where: { code: currentOrder.couponCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } }
      });
    }

    await db.order.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (error) {
    console.error("Order delete failed.", error);
    return NextResponse.json({ error: "Could not delete order." }, { status: 500 });
  }
}
