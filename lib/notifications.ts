import { db } from "@/lib/db";

type NotificationInput = {
  userId?: string | null;
  message: string;
  type: string;
};

export async function createNotification({ userId, message, type }: NotificationInput) {
  if (!userId) return null;

  try {
    return await db.notification.create({
      data: {
        userId,
        message,
        type
      }
    });
  } catch (error) {
    console.error("Notification create failed.", error);
    return null;
  }
}

export function orderPlacedMessage(orderNumber: string) {
  return `Your order ${orderNumber} has been placed successfully. We will review it shortly.`;
}

export function orderConfirmationMessage(orderNumber: string, status: string) {
  const messages: Record<string, string> = {
    CONFIRMED: `Your order ${orderNumber} has been confirmed.`,
    CANCELLED: `Your order ${orderNumber} has been cancelled.`
  };

  return messages[status] ?? `Your order ${orderNumber} confirmation status changed to ${status.toLowerCase()}.`;
}

export function orderDeliveryMessage(orderNumber: string, status: string) {
  const messages: Record<string, string> = {
    PROCESSING: `Your order ${orderNumber} is now processing.`,
    SHIPPED: `Your order ${orderNumber} has been shipped.`,
    DELIVERED: `Your order ${orderNumber} has been delivered.`,
    CANCELLED: `Delivery for order ${orderNumber} has been cancelled.`
  };

  return messages[status] ?? `Your order ${orderNumber} delivery status changed to ${status.toLowerCase()}.`;
}
