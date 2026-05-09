import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Sent",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

export default async function AdminAnalyticsPage() {
  const [orders, confirmedRevenue, customers, products] = await Promise.all([
    db.order.findMany({ select: { createdAt: true, total: true, status: true, confirmationStatus: true } }),
    db.order.aggregate({ _sum: { total: true }, where: { confirmationStatus: "CONFIRMED" } }),
    db.user.count({ where: { role: "USER" } }),
    db.product.count()
  ]);
  const confirmedOrders = orders.filter((order) => order.confirmationStatus === "CONFIRMED");
  const averageOrderValue = confirmedOrders.length ? Number(confirmedRevenue._sum.total ?? 0) / confirmedOrders.length : 0;
  const conversionBase = customers || 1;
  const ordersPerCustomer = orders.length / conversionBase;

  const rows = [
    { label: "Total orders", value: String(orders.length) },
    { label: "Confirmed revenue", value: formatBDT(Number(confirmedRevenue._sum.total ?? 0)) },
    { label: "Average order value", value: formatBDT(averageOrderValue) },
    { label: "Orders per customer", value: ordersPerCustomer.toFixed(2) },
    { label: "Active products", value: String(products) }
  ];

  return (
    <div className="min-w-0 md:bg-card md:p-5">
      <p className="text-sm font-bold uppercase text-primary">Performance</p>
      <h2 className="font-display text-2xl font-extrabold">Analytics</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl bg-card p-3 sm:p-4 md:bg-background">
            <p className="text-xs font-semibold leading-4 text-muted-foreground sm:text-sm">{row.label}</p>
            <p className="mt-2 break-words font-display text-lg font-extrabold leading-tight sm:text-2xl">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-card p-3 sm:p-4 md:bg-background">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-extrabold sm:text-lg">Order status mix</h3>
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-extrabold text-muted-foreground">{orders.length} total</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
          {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => {
            const count = orders.filter((order) => order.status === status).length;
            return (
              <div key={status} className="rounded-lg bg-muted p-2.5 sm:p-3">
                <p className="truncate text-xs font-bold text-muted-foreground">{statusLabels[status]}</p>
                <p className="mt-1 font-display text-lg font-extrabold leading-none sm:text-xl">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
