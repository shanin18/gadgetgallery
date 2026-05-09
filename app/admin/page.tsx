import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/app/admin/admin-ui";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

export default async function AdminPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [revenue, ordersToday, productCount, customerCount, recentOrders, lowStockProducts] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: { confirmationStatus: "CONFIRMED" }
    }),
    db.order.count({ where: { createdAt: { gte: startOfDay } } }),
    db.product.count(),
    db.user.count({ where: { role: "USER" } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } }
    }),
    db.product.findMany({
      where: { stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 5,
      include: { category: true }
    })
  ]);

  const stats = [
    { label: "Revenue", value: formatBDT(Number(revenue._sum.total ?? 0)), icon: TrendingUp },
    { label: "Orders today", value: String(ordersToday), icon: ShoppingCart },
    { label: "Products", value: String(productCount), icon: Package },
    { label: "Customers", value: String(customerCount), icon: Users }
  ];

  return (
    <div>
      <div className="flex gap-3 items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Overview</p>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Dashboard</h2>
        </div>
        <Link href="/admin/orders" className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-bold hover:bg-muted sm:w-auto">
          View orders
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl bg-card p-3 sm:p-5">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary sm:h-9 sm:w-9">
                <Icon size={17} />
              </div>
              <p className="mt-3 text-xs font-semibold text-muted-foreground sm:text-sm">{stat.label}</p>
              <p className="break-words font-display text-lg font-extrabold leading-tight sm:text-2xl">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl bg-card p-3 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold">Recent orders</h3>
            <Link href="/admin/orders" className="text-sm font-bold text-primary">All orders</Link>
          </div>
          {recentOrders.length ? (
            <div className="mt-4 grid gap-2 sm:gap-3">
              {recentOrders.map((order) => (
                <Link key={order.id} href="/admin/orders" className="grid gap-2 rounded-lg bg-background p-3 text-sm transition hover:bg-muted sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{order.orderNumber}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{order.user?.name ?? order.user?.email ?? "Guest checkout"}</p>
                  </div>
                  <StatusBadge value={order.status} />
                  <p className="font-display font-extrabold">{formatBDT(Number(order.total))}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">No orders have been placed yet.</p>
          )}
        </div>

        <div className="rounded-xl bg-card p-3 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold">Low stock</h3>
            <Link href="/admin/inventory" className="text-sm font-bold text-primary">Inventory</Link>
          </div>
          {lowStockProducts.length ? (
            <div className="mt-4 grid gap-2 sm:gap-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-lg bg-background p-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{product.category.name}</p>
                  </div>
                  <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-extrabold text-destructive">{product.stock} left</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">All products have healthy stock levels.</p>
          )}
        </div>
      </div>
    </div>
  );
}
