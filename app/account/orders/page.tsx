import { StatusBadge } from "@/app/admin/admin-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";
import { CalendarDays, CreditCard, PackageCheck, ReceiptText, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

function paymentMethodLabel(value: string) {
  const labels: Record<string, string> = {
    COD: "COD",
    STRIPE: "Stripe",
    PAYPAL: "PayPal",
    SSLCOMMERZ: "SSLCommerz"
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

export default async function OrdersPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin/orders");
  }

  const orders = session?.user?.id
    ? await db.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    : [];
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const activeOrders = orders.filter((order) => order.confirmationStatus !== "CANCELLED" && order.status !== "DELIVERED").length;

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b bg-muted/35 px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-primary">Purchases</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Order history</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track your latest orders, delivery progress and payment method from one place.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]">
            <div className="rounded-md border bg-background px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><ReceiptText size={15} /> Orders</div>
              <p className="mt-2 font-display text-2xl font-extrabold">{orders.length}</p>
            </div>
            <div className="rounded-md border bg-background px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><PackageCheck size={15} /> Active</div>
              <p className="mt-2 font-display text-2xl font-extrabold">{activeOrders}</p>
            </div>
            <div className="rounded-md border bg-background px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><ShoppingBag size={15} /> Total</div>
              <p className="mt-2 font-display text-xl font-extrabold">{formatBDT(totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>
      {orders.length ? (
        <div className="p-5 sm:p-6">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="rounded-l-md px-4 py-3">Order</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-3 py-3">Order status</th>
                  <th className="px-3 py-3">Delivery status</th>
                  <th className="px-3 py-3">Payment method</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="rounded-r-md text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const firstItem = order.items[0];
                  const productLabel = firstItem?.product?.name ?? "Product";
                  const extraItems = Math.max(order.items.length - 1, 0);

                  return (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="px-4 py-5 font-bold">{order.orderNumber}</td>
                      <td className="px-4 py-5">
                        <p className="max-w-[300px] truncate font-semibold">{productLabel}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {firstItem ? `Qty ${firstItem.quantity}` : "No items"}{extraItems ? ` + ${extraItems} more` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-5"><StatusBadge value={order.confirmationStatus} /></td>
                      <td className="px-3 py-5"><StatusBadge value={order.status} /></td>
                      <td className="px-3 py-5">
                        <span className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs font-extrabold">
                          <CreditCard size={14} />
                          {paymentMethodLabel(order.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-3 py-5 text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td className="text-right font-display text-base font-extrabold">{formatBDT(Number(order.total))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {orders.map((order) => {
              const firstItem = order.items[0];
              const productLabel = firstItem?.product?.name ?? "Product";
              const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div key={order.id} className="rounded-lg border bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Order</p>
                      <p className="mt-1 break-all font-extrabold">{order.orderNumber}</p>
                    </div>
                    <p className="shrink-0 font-display text-lg font-extrabold">{formatBDT(Number(order.total))}</p>
                  </div>
                  <div className="mt-4 rounded-md bg-muted/60 p-3">
                    <p className="truncate font-semibold">{productLabel}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{totalQuantity} item{totalQuantity === 1 ? "" : "s"}</p>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Order status</p>
                      <StatusBadge value={order.confirmationStatus} />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Delivery status</p>
                      <StatusBadge value={order.status} />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Payment method</p>
                      <span className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs font-extrabold">
                        <CreditCard size={14} />
                        {paymentMethodLabel(order.paymentMethod)}
                      </span>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Date</p>
                      <p className="inline-flex items-center gap-2 text-muted-foreground"><CalendarDays size={14} /> {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <p className="rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">You have not placed any orders yet.</p>
        </div>
      )}
    </div>
  );
}
