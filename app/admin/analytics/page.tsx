import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const [orders, paidRevenue, customers, products] = await Promise.all([
    db.order.findMany({ select: { createdAt: true, total: true, status: true, paymentStatus: true } }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    db.user.count({ where: { role: "USER" } }),
    db.product.count()
  ]);
  const paidOrders = orders.filter((order) => order.paymentStatus === "PAID");
  const averageOrderValue = paidOrders.length ? Number(paidRevenue._sum.total ?? 0) / paidOrders.length : 0;
  const conversionBase = customers || 1;
  const ordersPerCustomer = orders.length / conversionBase;

  const rows = [
    { label: "Total orders", value: String(orders.length) },
    { label: "Paid revenue", value: formatBDT(Number(paidRevenue._sum.total ?? 0)) },
    { label: "Average order value", value: formatBDT(averageOrderValue) },
    { label: "Orders per customer", value: ordersPerCustomer.toFixed(2) },
    { label: "Active products", value: String(products) }
  ];

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <p className="text-sm font-bold uppercase text-primary">Performance</p>
      <h2 className="font-display text-2xl font-extrabold">Analytics</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border bg-background p-4">
            <p className="text-sm font-semibold text-muted-foreground">{row.label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-lg border bg-background p-4">
        <h3 className="font-display text-lg font-extrabold">Order status mix</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => {
            const count = orders.filter((order) => order.status === status).length;
            return (
              <div key={status} className="rounded-md bg-muted p-3">
                <p className="text-xs font-bold uppercase text-muted-foreground">{status.toLowerCase()}</p>
                <p className="mt-1 font-display text-xl font-extrabold">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
