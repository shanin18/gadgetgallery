import type { Prisma } from "@prisma/client";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminOrderFilters } from "@/components/admin/AdminOrderFilters";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { InvoiceButton } from "@/components/admin/InvoiceButton";
import { OrderDetailsButton } from "@/components/admin/OrderDetailsButton";
import { StatusBadge } from "@/app/admin/admin-ui";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function shippingAddressLines(address: unknown) {
  if (!address || typeof address !== "object" || Array.isArray(address)) return ["No delivery address"];

  const record = address as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : "";
  const phone = typeof record.phone === "string" ? record.phone : "";
  const street = typeof record.street === "string" ? record.street : "";
  const city = typeof record.city === "string" ? record.city : "";
  const postalCode = typeof record.postalCode === "string" ? record.postalCode : "";
  const country = typeof record.country === "string" ? record.country : "";
  const cityLine = [city, postalCode].filter(Boolean).join(" - ");

  return [name, phone, street, cityLine, country].filter(Boolean);
}

function shippingPhone(address: unknown) {
  if (!address || typeof address !== "object" || Array.isArray(address)) return "";
  const phone = (address as Record<string, unknown>).phone;
  return typeof phone === "string" ? phone : "";
}

const confirmationStatuses = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
const deliveryStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const orderInclude = {
  user: { select: { name: true, email: true, phone: true } },
  items: {
    include: {
      product: { select: { name: true } }
    }
  }
} satisfies Prisma.OrderInclude;

type AdminOrder = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function validConfirmationStatus(value: string) {
  return confirmationStatuses.includes(value as (typeof confirmationStatuses)[number]) ? value : "";
}

function validDeliveryStatus(value: string) {
  return deliveryStatuses.includes(value as (typeof deliveryStatuses)[number]) ? value : "";
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 350));
    }
  }

  throw lastError;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const queryValue = params.q;
  const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const confirmationValue = params.confirmation;
  const confirmation = validConfirmationStatus((Array.isArray(confirmationValue) ? confirmationValue[0] : confirmationValue) ?? "");
  const deliveryValue = params.delivery;
  const delivery = validDeliveryStatus((Array.isArray(deliveryValue) ? deliveryValue[0] : deliveryValue) ?? "");
  let orders: AdminOrder[] = [];
  let loadError = "";

  try {
    orders = await withRetry(() =>
      db.order.findMany({
        where: {
          ...(query
            ? {
                OR: [
                  { orderNumber: { contains: query, mode: "insensitive" } },
                  { trackingNumber: { contains: query, mode: "insensitive" } },
                  { user: { name: { contains: query, mode: "insensitive" } } },
                  { user: { email: { contains: query, mode: "insensitive" } } }
                ]
              }
            : {}),
          ...(confirmation ? { confirmationStatus: confirmation as "PENDING" | "CONFIRMED" | "CANCELLED" } : {}),
          ...(delivery ? { status: delivery as "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" } : {})
        },
        orderBy: { createdAt: "desc" },
        include: orderInclude
      })
    );
  } catch (error) {
    console.error("Admin orders load failed.", error);
    loadError = "Could not load orders. Please refresh in a moment.";
  }

  return (
    <div className="min-w-0 md:bg-card md:p-5">
      <div>
        <p className="text-sm font-bold uppercase text-primary">Fulfillment</p>
        <h2 className="font-display text-2xl font-extrabold">Orders</h2>
      </div>
      <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_360px]">
        <AdminSearch initialValue={query} placeholder="Search orders" />
        <AdminOrderFilters confirmation={confirmation} delivery={delivery} />
      </div>

      {loadError ? (
        <p className="mt-5 rounded-md bg-destructive/10 p-4 text-sm font-semibold text-destructive">{loadError}</p>
      ) : orders.length ? (
        <>
          <div className="mt-5 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b px-3 py-3">Order ID</th>
                  <th className="border-b px-3 py-3">Customer</th>
                  <th className="border-b px-3 py-3">Product</th>
                  <th className="border-b px-3 py-3 text-right">Amount</th>
                  <th className="border-b px-3 py-3">Date</th>
                  <th className="border-b px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const addressLines = shippingAddressLines(order.shippingAddress);
                  const phone = order.user?.phone ?? shippingPhone(order.shippingAddress);
                  const firstItem = order.items[0];
                  const extraItems = Math.max(order.items.length - 1, 0);
                  const orderDetails = {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    date: formatDate(order.createdAt),
                    customerName: order.user?.name ?? addressLines[0] ?? "Guest",
                    customerEmail: order.user?.email ?? "No account",
                    customerPhone: phone || "No phone",
                    paymentMethod: order.paymentMethod,
                    confirmationStatus: order.confirmationStatus,
                    deliveryStatus: order.status,
                    shippingAddress: addressLines,
                    items: order.items.map((item) => ({ name: item.product.name, quantity: item.quantity, price: Number(item.price) })),
                    subtotal: Number(order.subtotal),
                    discount: Number(order.discount),
                    deliveryCharge: Number(order.shipping),
                    tax: Number(order.tax),
                    total: Number(order.total)
                  };

                  return (
                    <tr key={order.id} className="align-middle">
                      <td className="border-b px-3 py-4">
                        <p className="max-w-32 break-words text-xs font-extrabold leading-5">{order.orderNumber}</p>
                      </td>
                      <td className="border-b px-3 py-4">
                        <p className="max-w-40 truncate font-bold">{order.user?.name ?? addressLines[0] ?? "Guest"}</p>
                      </td>
                      <td className="border-b px-3 py-4">
                        <p className="max-w-48 truncate font-semibold">{firstItem?.product.name ?? "No items"}</p>
                        {extraItems ? <p className="mt-1 text-xs font-semibold text-muted-foreground">+{extraItems} more</p> : null}
                      </td>
                      <td className="whitespace-nowrap border-b px-3 py-4 text-right font-display text-sm font-extrabold">{formatBDT(Number(order.total))}</td>
                      <td className="whitespace-nowrap border-b px-3 py-4 text-xs font-semibold text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td className="border-b px-3 py-4">
                        <div className="flex justify-end gap-1">
                          <OrderDetailsButton order={orderDetails} />
                          <InvoiceButton order={orderDetails} />
                          <ConfirmDeleteButton endpoint={`/api/orders/${order.id}`} itemName={order.orderNumber} iconOnly />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 lg:hidden">
            {orders.map((order) => {
              const addressLines = shippingAddressLines(order.shippingAddress);
              const phone = order.user?.phone ?? shippingPhone(order.shippingAddress);
              const firstItem = order.items[0];
              const extraItems = Math.max(order.items.length - 1, 0);
              const orderDetails = {
                orderId: order.id,
                orderNumber: order.orderNumber,
                date: formatDate(order.createdAt),
                customerName: order.user?.name ?? addressLines[0] ?? "Guest",
                customerEmail: order.user?.email ?? "No account",
                customerPhone: phone || "No phone",
                paymentMethod: order.paymentMethod,
                confirmationStatus: order.confirmationStatus,
                deliveryStatus: order.status,
                shippingAddress: addressLines,
                items: order.items.map((item) => ({ name: item.product.name, quantity: item.quantity, price: Number(item.price) })),
                subtotal: Number(order.subtotal),
                discount: Number(order.discount),
                deliveryCharge: Number(order.shipping),
                tax: Number(order.tax),
                total: Number(order.total)
              };

              return (
                <article key={order.id} className="min-w-0 rounded-xl bg-card p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-extrabold">{order.orderNumber}</p>
                      <p className="mt-1 truncate text-sm font-semibold">{order.user?.name ?? addressLines[0] ?? "Guest"}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {firstItem?.product.name ?? "No items"}{extraItems ? ` +${extraItems} more` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-sm font-extrabold">{formatBDT(Number(order.total))}</p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="grid gap-2">
                      <p className="text-xs font-semibold text-muted-foreground">{formatDate(order.createdAt)}</p>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={order.confirmationStatus} />
                        <StatusBadge value={order.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <OrderDetailsButton order={orderDetails} />
                      <InvoiceButton order={orderDetails} />
                      <ConfirmDeleteButton endpoint={`/api/orders/${order.id}`} itemName={order.orderNumber} iconOnly />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">No orders found.</p>
      )}
    </div>
  );
}
