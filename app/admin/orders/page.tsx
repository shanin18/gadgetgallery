import { AdminSearch } from "@/components/admin/AdminSearch";
import { StatusBadge } from "@/app/admin/admin-ui";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const queryValue = params.q;
  const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const orders = await db.order.findMany({
    where: query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" } },
            { trackingNumber: { contains: query, mode: "insensitive" } },
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: true
    }
  });

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase text-primary">Fulfillment</p>
        <h2 className="font-display text-2xl font-extrabold">Orders</h2>
      </div>
      <div className="mt-5">
        <AdminSearch initialValue={query} placeholder="Search orders" />
      </div>

      {orders.length ? (
        <>
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-3">Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-4 font-extrabold">{order.orderNumber}</td>
                    <td>
                      <p className="font-semibold">{order.user?.name ?? "Guest"}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email ?? "No account"}</p>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items.length}</td>
                    <td><StatusBadge value={order.status} /></td>
                    <td><StatusBadge value={order.paymentStatus} /></td>
                    <td className="text-right font-display font-extrabold">{formatBDT(Number(order.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <p className="font-display font-extrabold">{formatBDT(Number(order.total))}</p>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <p><span className="text-muted-foreground">Customer:</span> {order.user?.name ?? order.user?.email ?? "Guest"}</p>
                  <p><span className="text-muted-foreground">Items:</span> {order.items.length}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge value={order.status} />
                  <StatusBadge value={order.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">No orders found.</p>
      )}
    </div>
  );
}
