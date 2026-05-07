import { StatusBadge } from "@/app/admin/admin-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

export default async function OrdersPage() {
  const session = await auth();
  const orders = session?.user?.id
    ? await db.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { items: true }
      })
    : [];

  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="font-display text-2xl font-extrabold">Order history</h2>
      {orders.length ? (
        <>
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-3">Order</th>
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
                    <td className="py-4 font-bold">{order.orderNumber}</td>
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge value={order.status} />
                  <StatusBadge value={order.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">You have not placed any orders yet.</p>
      )}
    </div>
  );
}
